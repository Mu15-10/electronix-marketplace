import {
  Injectable, BadRequestException, UnauthorizedException,
  ConflictException, NotFoundException, InternalServerErrorException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import { v4 as uuid } from 'uuid';
import { User, UserRole, UserStatus, SellerLevel } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuditLog, AuditAction } from '../audit/entities/audit.entity';
import { LoggerService } from '../../config/logger.config';

@Injectable()
export class AuthService {
  private readonly logger = new LoggerService('AuthService');

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<{ user: Partial<User>; message: string }> {
    const existing = await this.userRepository.findOne({
      where: [{ email: dto.email }, ...(dto.username ? [{ username: dto.username }] : [])],
    });

    if (existing) {
      if (existing.email === dto.email) {
        throw new ConflictException('Email already registered');
      }
      if (dto.username && existing.username === dto.username) {
        throw new ConflictException('Username already taken');
      }
    }

    const passwordHash = await argon2.hash(dto.password, {
      type: argon2.argon2id,
      memoryCost: 19456,
      timeCost: 2,
      parallelism: 1,
    });

    const emailVerificationToken = uuid();

    const user = this.userRepository.create({
      email: dto.email,
      passwordHash,
      username: dto.username || dto.email.split('@')[0],
      displayName: dto.displayName || dto.username || dto.email.split('@')[0],
      emailVerificationToken,
      isEmailVerified: false,
      notificationPreferences: {
        email: true,
        push: true,
        sms: false,
        marketing: false,
      },
    });

    try {
      await this.userRepository.save(user);

      await this.auditLogRepository.save({
        action: AuditAction.CREATE,
        description: `User registered: ${user.email}`,
        entityType: 'user',
        entityId: user.id,
        userId: user.id,
      });

      return {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          displayName: user.displayName,
        },
        message: 'Registration successful. Please check your email to verify your account.',
      };
    } catch (error) {
      this.logger.error(`Registration failed: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Registration failed');
    }
  }

  async login(
    dto: LoginDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ accessToken: string; refreshToken: string; user: Partial<User>; requiresTwoFactor?: boolean }> {
    const user = await this.userRepository.findOne({ where: { email: dto.email } });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.status === UserStatus.SUSPENDED || user.status === UserStatus.BANNED) {
      throw new ForbiddenException(`Account is ${user.status}. Contact support.`);
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new ForbiddenException('Account is temporarily locked. Try again later.');
    }

    const isPasswordValid = await argon2.verify(user.passwordHash, dto.password);
    if (!isPasswordValid) {
      user.failedLoginAttempts += 1;
      if (user.failedLoginAttempts >= 5) {
        user.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
      }
      await this.userRepository.save(user);
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.failedLoginAttempts > 0) {
      user.failedLoginAttempts = 0;
      user.lockedUntil = null;
    }

    if (user.isTwoFactorEnabled) {
      if (!dto.twoFactorCode) {
        return {
          requiresTwoFactor: true,
          accessToken: '',
          refreshToken: '',
          user: { id: user.id, email: user.email },
        };
      }

      const isValid = speakeasy.totp.verify({
        secret: user.twoFactorSecret!,
        encoding: 'base32',
        token: dto.twoFactorCode,
        window: 1,
      });

      if (!isValid) {
        throw new UnauthorizedException('Invalid two-factor authentication code');
      }
    }

    const tokens = await this.generateTokens(user);
    user.refreshToken = tokens.refreshToken;
    user.lastLoginAt = new Date();
    user.lastLoginIp = ipAddress || '';
    await this.userRepository.save(user);

    await this.auditLogRepository.save({
      action: AuditAction.LOGIN,
      description: `User logged in: ${user.email}`,
      entityType: 'user',
      entityId: user.id,
      userId: user.id,
      ipAddress,
      userAgent,
    });

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        role: user.role,
        isTwoFactorEnabled: user.isTwoFactorEnabled,
        isSeller: user.isSeller,
        sellerLevel: user.sellerLevel,
      },
    };
  }

  async refreshToken(
    refreshToken: string,
    ipAddress?: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret-key',
      });

      const user = await this.userRepository.findOne({
        where: { id: payload.sub, status: UserStatus.ACTIVE },
      });

      if (!user || user.refreshToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const tokens = await this.generateTokens(user);
      user.refreshToken = tokens.refreshToken;
      await this.userRepository.save(user);

      return tokens;
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) return null;
    const isValid = await argon2.verify(user.passwordHash, password);
    return isValid ? user : null;
  }

  async generateTwoFactorSecret(userId: string): Promise<{ secret: string; qrCodeUrl: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const secret = speakeasy.generateSecret({
      name: `ElectronixMarketplace:${user.email}`,
      length: 20,
    });

    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

    return { secret: secret.base32, qrCodeUrl };
  }

  async verifyTwoFactor(token: string, secret: string): Promise<boolean> {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 1,
    });
  }

  async enableTwoFactor(userId: string, secret: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    user.twoFactorSecret = secret;
    user.isTwoFactorEnabled = true;

    const backupCodes = Array.from({ length: 10 }, () =>
      Math.random().toString(36).substring(2, 10).toUpperCase(),
    );
    user.twoFactorBackupCodes = backupCodes;

    await this.userRepository.save(user);

    await this.auditLogRepository.save({
      action: AuditAction.UPDATE,
      description: 'Two-factor authentication enabled',
      entityType: 'user',
      entityId: userId,
      userId,
    });
  }

  async disableTwoFactor(userId: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    user.twoFactorSecret = null;
    user.isTwoFactorEnabled = false;
    user.twoFactorBackupCodes = null;
    await this.userRepository.save(user);

    await this.auditLogRepository.save({
      action: AuditAction.UPDATE,
      description: 'Two-factor authentication disabled',
      entityType: 'user',
      entityId: userId,
      userId,
    });
  }

  async generateTokens(user: User): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET || 'access-secret-key',
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret-key',
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: { emailVerificationToken: token },
    });

    if (!user) throw new BadRequestException('Invalid verification token');

    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    await this.userRepository.save(user);

    return { message: 'Email verified successfully' };
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) throw new NotFoundException('User with this email not found');

    const resetToken = uuid();
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
    await this.userRepository.save(user);

    this.logger.log(`Password reset token generated for ${email}: ${resetToken}`);

    return { message: 'If the email exists, a reset link has been sent' };
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: { passwordResetToken: token },
    });

    if (!user) throw new BadRequestException('Invalid reset token');

    if (user.passwordResetExpires && user.passwordResetExpires < new Date()) {
      throw new BadRequestException('Reset token has expired');
    }

    user.passwordHash = await argon2.hash(newPassword, {
      type: argon2.argon2id,
      memoryCost: 19456,
      timeCost: 2,
      parallelism: 1,
    });
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await this.userRepository.save(user);

    await this.auditLogRepository.save({
      action: AuditAction.UPDATE,
      description: 'Password reset completed',
      entityType: 'user',
      entityId: user.id,
      userId: user.id,
    });

    return { message: 'Password reset successful' };
  }

  async logout(userId: string, refreshToken?: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (user) {
      if (refreshToken && user.refreshToken === refreshToken) {
        user.refreshToken = null;
        await this.userRepository.save(user);
      }

      await this.auditLogRepository.save({
        action: AuditAction.LOGOUT,
        description: 'User logged out',
        entityType: 'user',
        entityId: userId,
        userId,
      });
    }
  }

  async getProfile(userId: string): Promise<Partial<User>> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    const { passwordHash, refreshToken, twoFactorSecret, twoFactorBackupCodes, emailVerificationToken, passwordResetToken, passwordResetExpires, ...profile } = user;
    return profile;
  }
}
