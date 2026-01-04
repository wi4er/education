import { PermissionMethod } from './permission.method';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { CommonPermissionEntity } from '../entities/common-permission.entity';
import { PermissionException } from '../../exception/permission/permission.exception';
import { JwtService } from '@nestjs/jwt';
import { WithPermissions } from '../entities/with-permissions.entity';

const COOKIE_NAME = 'auth_token';

export const CHECK_PARENT_PERMISSION = 'CHECK_PARENT_PERMISSION';

export interface CheckParentPermissionOptions<T> {
  entity: new () => { id: string, parent: WithPermissions<T> };
  idParam?: string;
  method: PermissionMethod;
}

export function CheckParentPermission<T>(
  entity: new () => { id: string, parent: WithPermissions<T> },
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
    private readonly jwtService: JwtService,
  ) {
  }

  private getUserGroups(request: any): string[] {
    const token = request.cookies?.[COOKIE_NAME];
    if (!token) return [];

    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });

      return payload.groups ?? [];
    } catch {
      return [];
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const check = this.reflector.get<CheckParentPermissionOptions<any>>(
      CHECK_PARENT_PERMISSION,
      context.getHandler(),
    );

    if (!check) return true;

    const { entity, idParam, method } = check;
    const id = request.params[idParam];

    if (!id) return true;

    const found = await this.manager.findOne(entity, {
      where: { id },
      relations: { parent: { permissions: true } },
    });

    if (!found) return true;

    const permissions: CommonPermissionEntity<any>[] | undefined = found.parent.permissions;
    const userGroups = this.getUserGroups(request);

    const hasPermission = permissions?.some(
      perm =>
        (perm.method === method || perm.method === PermissionMethod.ALL) &&
        (perm.groupId === null ||
          perm.groupId === undefined ||
          userGroups.includes(perm.groupId)),
    );

    if (!hasPermission) throw new PermissionException(entity.name, method, id);

    return true;
  }
}
