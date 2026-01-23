import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

const COOKIE_NAME = 'auth_token';

export const CurrentGroups = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string[] => {
    const request = ctx.switchToHttp().getRequest();
    const token = request.cookies?.[COOKIE_NAME];

    if (!token) return [];

    try {
      const jwtService = new JwtService({
        secret: process.env.JWT_SECRET || 'development-secret-key',
      });
      const payload = jwtService.verify(token);
      return payload.groups ?? [];
    } catch {
      return [];
    }
  },
);
