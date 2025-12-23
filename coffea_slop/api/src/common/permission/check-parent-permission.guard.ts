import { PermissionMethod } from './permission.method';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager, ObjectType } from 'typeorm';
import { Observable } from 'rxjs';
import { CommonPermissionEntity } from '../entities/common-permission.entity';

export const CHECK_PARENT_PERMISSION = 'CHECK_PARENT_PERMISSION';

export interface CheckParentPermissionOptions<T> {
  entity: new () => { parentId: CommonPermissionEntity<T> };
  idParam?: string;
  method: PermissionMethod;
}

export function CheckParentPermission(
  entity: new () => { parent: CommonPermissionEntity<any> },
  method: PermissionMethod,
  idParam: string = 'id',
) {
  return SetMetadata(CHECK_PARENT_PERMISSION, { entity, method, idParam });
}

@Injectable()
export class CheckParentPermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @InjectEntityManager()
    private manager: EntityManager,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;

    const check = this.reflector.get<CheckParentPermissionOptions<any>>(
      CHECK_PARENT_PERMISSION,
      context.getHandler(),
    );

    if (!check) return true;

    const { entity, idParam } = check;
    const id = request.params[idParam];

    if (!id) return true;

    const found = await this.manager.findOne(entity, {
      where: { parentId: id },
    });

    return true;
  }
}
