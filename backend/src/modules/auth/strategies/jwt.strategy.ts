import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { JwtPayload } from '../../../common/interfaces/jwt-payload.interface';
import { LoggerService } from '../../../config/logger.config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  private readonly logger = new LoggerService('JwtStrategy');

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_ACCESS_SECRET || 'access-secret-key',
      ignoreExpiration: false,
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: payload.sub, status: 'active' as any },
      });

      if (!user) {
        throw new UnauthorizedException('User not found or inactive');
      }

      return user;
    } catch (error) {
      this.logger.error(`JWT validation failed: ${error.message}`, error.stack);
      throw new UnauthorizedException('Invalid token');
    }
  }
}
