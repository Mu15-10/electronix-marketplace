import { Injectable, NotFoundException, BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import * as argon2 from 'argon2';
import { User, UserStatus, SellerLevel, UserRole } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuditLog, AuditAction } from '../audit/entities/audit.entity';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';
import { LoggerService } from '../../config/logger.config';

@Injectable()
export class UsersService {
  private readonly logger = new LoggerService('UsersService');

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['listings'],
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByPhone(phone: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { phoneNumber: phone } });
  }

  async create(dto: Partial<User>): Promise<User> {
    const existing = await this.userRepository.findOne({
      where: [{ email: dto.email }, ...(dto.username ? [{ username: dto.username }] : [])],
    });
    if (existing) throw new ConflictException('User already exists');
    const user = this.userRepository.create(dto);
    return this.userRepository.save(user);
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    Object.assign(user, dto);
    await this.userRepository.save(user);
    return this.findById(id);
  }

  async updatePassword(id: string, oldPassword: string, newPassword: string): Promise<void> {
    const user = await this.findById(id);
    const isMatch = await argon2.verify(user.passwordHash, oldPassword);
    if (!isMatch) throw new BadRequestException('Current password is incorrect');

    user.passwordHash = await argon2.hash(newPassword, {
      type: argon2.argon2id,
      memoryCost: 19456,
      timeCost: 2,
      parallelism: 1,
    });
    await this.userRepository.save(user);

    await this.auditLogRepository.save({
      action: AuditAction.UPDATE,
      description: 'Password updated',
      entityType: 'user',
      entityId: id,
      userId: id,
    });
  }

  async updateTrustScore(id: string, score: number): Promise<void> {
    await this.userRepository.update(id, { trustScore: Math.max(0, Math.min(100, score)) });
  }

  async updateSellerLevel(id: string, level: SellerLevel): Promise<void> {
    await this.userRepository.update(id, { sellerLevel: level });
  }

  async getDashboardData(userId: string): Promise<any> {
    const user = await this.findById(userId);
    const { passwordHash, refreshToken, twoFactorSecret, ...safeUser } = user;
    return {
      user: safeUser,
      stats: {
        totalListings: user.listings?.length || 0,
        totalSales: 0,
        totalReviews: 0,
        trustScore: user.trustScore,
        sellerLevel: user.sellerLevel,
      },
    };
  }

  async searchUsers(query: string, pagination: { page: number; limit: number }): Promise<PaginatedResult<User>> {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    const [items, total] = await this.userRepository.findAndCount({
      where: [
        { email: Like(`%${query}%`) },
        { username: Like(`%${query}%`) },
        { displayName: Like(`%${query}%`) },
      ],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async suspendUser(id: string, reason: string): Promise<User> {
    const user = await this.findById(id);
    user.status = UserStatus.SUSPENDED;
    await this.userRepository.save(user);

    await this.auditLogRepository.save({
      action: AuditAction.SUSPEND,
      description: `User suspended: ${reason}`,
      entityType: 'user',
      entityId: id,
    });

    return user;
  }

  async reactivateUser(id: string): Promise<User> {
    const user = await this.findById(id);
    user.status = UserStatus.ACTIVE;
    user.failedLoginAttempts = 0;
    user.lockedUntil = null as any;
    await this.userRepository.save(user);

    await this.auditLogRepository.save({
      action: AuditAction.UPDATE,
      description: 'User reactivated',
      entityType: 'user',
      entityId: id,
    });

    return user;
  }

  async getStatistics(): Promise<any> {
    const total = await this.userRepository.count();
    const active = await this.userRepository.count({ where: { status: UserStatus.ACTIVE } });
    const suspended = await this.userRepository.count({ where: { status: UserStatus.SUSPENDED } });
    const sellers = await this.userRepository.count({ where: { isSeller: true } });
    const verified = await this.userRepository.count({ where: { isEmailVerified: true } });

    return { total, active, suspended, sellers, verified };
  }
}
