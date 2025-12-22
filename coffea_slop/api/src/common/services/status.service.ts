import { Injectable } from '@nestjs/common';
import { EntityManager, EntityTarget } from 'typeorm';
import { CommonStatusEntity } from '../entities/common-status.entity';

@Injectable()
export class StatusService {

  async create<T>(
    transaction: EntityManager,
    statusClass: EntityTarget<CommonStatusEntity<T>>,
    parentId: string,
    statusIds: string[] = [],
  ): Promise<Array<CommonStatusEntity<T>>> {
    if (statusIds.length === 0) {
      return [];
    }

    const entities = statusIds.map(
      statusId => transaction.create(statusClass, {
        parentId,
        statusId,
      }),
    );

    return transaction.save(entities);
  }

  async update<T>(
    transaction: EntityManager,
    statusClass: EntityTarget<CommonStatusEntity<T>>,
    parentId: string,
    statusIds: string[] = [],
  ): Promise<Array<CommonStatusEntity<T>>> {
    const existing = await transaction.find(statusClass, { where: { parentId } as any });

    const toDelete: number[] = [];
    const toInsert: string[] = [];

    const existingSet = new Set(existing.map(e => e.statusId));
    const inputSet = new Set(statusIds);

    for (const statusId of statusIds) {
      if (!existingSet.has(statusId)) {
        toInsert.push(statusId);
      }
    }

    for (const e of existing) {
      if (!inputSet.has(e.statusId)) {
        toDelete.push(e.id);
      }
    }

    if (toDelete.length > 0) {
      await transaction.delete(statusClass, toDelete);
    }

    if (toInsert.length > 0) {
      const entities = toInsert.map(
        statusId => transaction.create(statusClass, {
          parentId,
          statusId,
        }),
      );
      await transaction.save(entities);
    }

    return transaction.find(statusClass, { where: { parentId } as any });
  }

}
