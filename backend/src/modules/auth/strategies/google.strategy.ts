import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { LoggerService } from '../../../config/logger.config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  private readonly logger = new LoggerService('GoogleStrategy');

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    try {
      const { name, emails, photos } = profile;
      const email = emails?.[0]?.value;
      const displayName = name?.givenName
        ? `${name.givenName} ${name.familyName || ''}`.trim()
        : profile.displayName;
      const avatarUrl = photos?.[0]?.value;

      let user = await this.userRepository.findOne({ where: { email } });

      if (!user) {
        user = this.userRepository.create({
          email,
          displayName: displayName || email.split('@')[0],
          avatarUrl,
          isEmailVerified: true,
          passwordHash: '',
          username: email.split('@')[0],
        });
        await this.userRepository.save(user);
      } else if (!user.avatarUrl && avatarUrl) {
        user.avatarUrl = avatarUrl;
        await this.userRepository.save(user);
      }

      done(null, user);
    } catch (error) {
      this.logger.error(`Google OAuth validation failed: ${error.message}`, error.stack);
      done(error, false);
    }
  }
}
