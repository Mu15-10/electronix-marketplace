import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { JwtPayload } from '../../../common/interfaces/jwt-payload.interface';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          const cookie = request?.cookies?.['refresh_token'];
          if (cookie) return cookie;
          const authHeader = request?.headers?.authorization;
          if (authHeader?.startsWith('Bearer ')) {
            return authHeader.substring(7);
          }
          const body = request?.body;
          if (body?.refreshToken) return body.refreshToken;
          return null;
        },
      ]),
      secretOrKey: process.env.JWT_REFRESH_SECRET || 'refresh-secret-key',
      passReqToCallback: true,
      ignoreExpiration: false,
    });
  }

  async validate(request: Request, payload: JwtPayload): Promise<any> {
    const refreshToken =
      request?.cookies?.['refresh_token'] ||
      request?.body?.refreshToken ||
      request?.headers?.authorization?.substring(7);

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not provided');
    }

    const user = await this.userRepository.findOne({
      where: { id: payload.sub, status: 'active' as any },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return { ...payload, refreshToken };
  }
}
