import { Injectable } from '@nestjs/common';
import { EntityManager, EntityTarget } from 'typeorm';
import { CommonPermissionEntity } from '../entities/common-permission.entity';
import { CommonPermissionInput } from '../inputs/common-permission.input';

@Injectable()
export class PermissionAttributeService {

  async create<T>(
    transaction: EntityManager,
    permissionClass: EntityTarget<CommonPermissionEntity<T>>,
    permissions: CommonPermissionInput[] = [],
  ): Promise<Array<CommonPermissionEntity<T>>> {
    const permissionEntities = permissions.map(
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
    await transaction.delete(permissionClass, { parentId });

    const permissionEntities = permissions.map(
      perm => transaction.create(
        permissionClass,
        {
          ...perm,
          parentId,
        },
      ),
    );

    return transaction.save(permissionEntities);
  }

}
