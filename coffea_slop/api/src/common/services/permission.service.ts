import { Injectable } from '@nestjs/common';
import { EntityManager, EntityTarget } from 'typeorm';
import { CommonPermissionEntity } from '../entities/common-permission.entity';
import { CommonPermissionInput } from '../inputs/common-permission.input';
import { PermissionMethod } from '../permission/permission.method';
import { env } from '../config/env.config';

@Injectable()
export class PermissionService {

  private ensureAdminPermission(permissions: CommonPermissionInput[], parentId: string): CommonPermissionInput[] {
    const hasAdminAll = permissions.some(
      p => p.groupId === env.ADMIN_GROUP && p.method === PermissionMethod.ALL,
    );

    if (!hasAdminAll) {
      return [
        ...permissions,
        { parentId, groupId: env.ADMIN_GROUP, method: PermissionMethod.ALL },
      ];
    }

    return permissions;
  }

  async create<T>(
    transaction: EntityManager,
    permissionClass: EntityTarget<CommonPermissionEntity<T>>,
    permissions: CommonPermissionInput[] = [],
    parentId?: string,
  ): Promise<Array<CommonPermissionEntity<T>>> {
    const permissionsWithAdmin = this.ensureAdminPermission(
      permissions,
      parentId || permissions[0]?.parentId,
    );

    const permissionEntities = permissionsWithAdmin.map(
      perm => transaction.create(
        permissionClass,
        perm,
      ),
    );

    return transaction.save(permissionEntities);
  }

  async update<T>(
    transaction: EntityManager,
    permissionClass: EntityTarget<CommonPermissionEntity<T>>,
    parentId: string,
    permissions: CommonPermissionInput[] = [],
  ): Promise<Array<CommonPermissionEntity<T>>> {
    const permissionsWithAdmin = this.ensureAdminPermission(permissions, parentId);

    const existing = await transaction.find(permissionClass, {
      where: { parentId } as any,
    });

    const toDelete: number[] = [];
    const toCreate: CommonPermissionInput[] = [];

    for (const perm of permissionsWithAdmin) {
      const found = existing.find(
        e => e.groupId === perm.groupId && e.method === perm.method,
      );

      if (!found) {
        toCreate.push(perm);
      }
    }

    for (const e of existing) {
      const found = permissionsWithAdmin.find(
        p => p.groupId === e.groupId && p.method === e.method,
      );

      if (!found) {
        toDelete.push(e.id);
      }
    }

    if (toDelete.length > 0) {
      await transaction.delete(permissionClass, toDelete);
    }

    const createdEntities = toCreate.map(
      perm => transaction.create(
        permissionClass,
        {
          ...perm,
          parentId,
        },
      ),
    );

    if (createdEntities.length > 0) {
      await transaction.save(createdEntities);
    }

    return transaction.find(permissionClass, {
      where: { parentId } as any,
    });
  }

}
