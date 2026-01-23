import {
  Injectable,
  CanActivate,
  ExecutionContext,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { AccessEntity } from './access-entity.enum';
import { AccessMethod } from '../../personal/entities/access/access-method.enum';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';

export const CHECK_METHOD_ACCESS = 'CHECK_METHOD_ACCESS';

export function CheckMethodAccess(target: AccessEntity, method: AccessMethod) {
  return SetMetadata(CHECK_METHOD_ACCESS, { target, method });
}

@Injectable()
export class CheckMethodAccessGuard
  implements CanActivate {

  constructor(
    private readonly reflector: Reflector,
    @InjectEntityManager()
    private manager: EntityManager,
  ) {
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;

    const check = this.reflector.get<{
      target: AccessEntity;
      method: AccessMethod;
    }>(CHECK_METHOD_ACCESS, context.getHandler());

    if (!check) return true;

    return true;
  }
  ß
}
