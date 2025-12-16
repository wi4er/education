import { Injectable, CanActivate, ExecutionContext, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager, ObjectType } from 'typeorm';
import { PermissionMethod } from './permission.method';

export const CHECK_ID_PERMISSION = 'CHECK_ID_PERMISSION';

export interface CheckIdPermissionOptions<T> {

  entity: ObjectType<T>;
  method: PermissionMethod;
  idParam?: string;

}

export function CheckIdPermission<T>(
  entity: ObjectType<T>,
  method: PermissionMethod,
  idParam: string = 'id',
) {
  return SetMetadata(CHECK_ID_PERMISSION, { entity, method, idParam });
}

@Injectable()
export class CheckIdPermissionGuard implements CanActivate {

  constructor(
    private readonly reflector: Reflector,
    @InjectEntityManager()
    private manager: EntityManager,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const check = this.reflector.get<CheckIdPermissionOptions<any>>(
      CHECK_ID_PERMISSION,
      context.getHandler(),
    );

    if (!check) {
      return true;
    }

    // TODO: Implement permission check logic

    return true;
  }

}
