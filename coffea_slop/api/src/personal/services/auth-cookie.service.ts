import { Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { PermissionException } from '../../exception/permission/permission.exception';
import { PermissionMethod } from '../../common/permission/permission.method';
import { User } from '../entities/user/user.entity';

const COOKIE_NAME = 'auth_token';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: COOKIE_MAX_AGE,
};

interface TokenPayload {
  sub: string;
  login: string;
  groups: string[];
}

@Injectable()
export class AuthCookieService {

  constructor(
    private readonly jwtService: JwtService,
  ) {
  }

  private createPayload(
    userId: string,
    login?: string,
    groups: string[] = [],
  ): TokenPayload {
    return { sub: userId, login: login ?? userId, groups };
  }

  private signToken(
    payload: TokenPayload,
    options?: JwtSignOptions,
  ): string {
    return this.jwtService.sign(payload, options);
  }

  getCurrentUserId(req: Request): string {
    const token = req.cookies?.[COOKIE_NAME];

    if (!token) throw new PermissionException('User', PermissionMethod.AUTH);

    try {
      const payload = this.jwtService.verify(token);
      return payload.sub;
    } catch {
      throw new PermissionException('User', PermissionMethod.AUTH);
    }
  }

  setAuthCookie(res: Response, user: User): void {
    const payload = this.createPayload(
      user.id,
      user.login,
      user.groups?.map(g => g.groupId),
    );

    res.cookie(
      COOKIE_NAME,
      this.signToken(payload),
      COOKIE_OPTIONS,
    );
  }

  clearAuthCookie(res: Response): void {
    res.clearCookie(COOKIE_NAME);
  }

  createAuthCookie(
    userId: string,
    login?: string,
    groups: string[] = [],
  ): string {
    return `${COOKIE_NAME}=${this.signToken(this.createPayload(userId, login, groups))}`;
  }

  createExpiredAuthCookie(userId: string): string {
    return `${COOKIE_NAME}=${this.signToken(this.createPayload(userId), { expiresIn: '-1s' })}`;
  }

}
