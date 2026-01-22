import {
  CanActivate,
  ExecutionContext,
  Injectable,
  SetMetadata,
} from '@nestjs/common';
import {Reflector} from '@nestjs/core';
import {InjectEntityManager} from '@nestjs/typeorm';
import {EntityManager} from 'typeorm';
import {JwtService} from '@nestjs/jwt';
import {PermissionMethod} from './permission.method';
import {WithPermissions} from '../entities/with-permissions.entity';
import {PermissionException} from '../../exception/permission/permission.exception';

const COOKIE_NAME = 'auth_token';

export const CHECK_ID_PERMISSION = 'CHECK_ID_PERMISSION';

export interface CheckIdPermissionOptions<T> {
  entity: new () => WithPermissions<T>;
  method: PermissionMethod;
  idParam?: string;
}

export function CheckIdPermission<T>(
  entity: new () => WithPermissions<T>,
  method: PermissionMethod,
  idParam: string = 'id',
) {
  return SetMetadata(CHECK_ID_PERMISSION, { entity, method, idParam });
}

@Injectable()
export class CheckIdPermissionGuard
  implements CanActivate {

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

    const check = this.reflector.get<CheckIdPermissionOptions<any>>(
      CHECK_ID_PERMISSION,
      context.getHandler(),
    );

    if (!check) return true;

    const { method, entity, idParam } = check;
    const id = request.params[idParam];

    if (!id) return true;

    const found = await this.manager.findOne(entity, {
      where: { id },
      relations: ['permissions'],
    });

    if (!found) return true;

    const userGroups = this.getUserGroups(request);

    const hasPermission = found.permissions?.some(
      (perm) =>
        (perm.method === method || perm.method === PermissionMethod.ALL) &&
        (perm.groupId === null ||
          perm.groupId === undefined ||
          userGroups.includes(perm.groupId)),
    );

    if (!hasPermission) throw new PermissionException(entity.name, method, id);

    return true;
  }

}
