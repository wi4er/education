import { PermissionMethod } from './permission.method';
import { CanActivate, ExecutionContext, Injectable, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { Observable } from 'rxjs';
import { CommonPermissionEntity } from '../entities/common-permission.entity';

export const CHECK_PARENT_PERMISSION = 'CHECK_PARENT_PERMISSION';

export function CheckIdPermission(
  entity: new() => { parent: CommonPermissionEntity<any> },
  method: PermissionMethod,
) {
  return SetMetadata(CHECK_PARENT_PERMISSION, { entity, method });
}

@Injectable()
export class CheckIdPermissionGuard implements CanActivate {

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

    const check = this.reflector.get<{}>(
      CHECK_PARENT_PERMISSION,
      context.getHandler(),
    );

    if (!check) {
      return true;
    }

    return true;
  }

}