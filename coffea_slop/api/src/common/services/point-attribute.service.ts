import { Injectable } from '@nestjs/common';
import { EntityManager, EntityTarget } from 'typeorm';
import { CommonPointEntity } from '../entities/common-point.entity';
import { CommonPointInput } from '../inputs/common-point.input';

@Injectable()
export class PointAttributeService {

  async create<T>(
    transaction: EntityManager,
    pointClass: EntityTarget<CommonPointEntity<T>>,
    parentId: string,
    points: CommonPointInput[] = [],
  ): Promise<Array<CommonPointEntity<T>>> {
    const pointEntities = points.map(
      pnt => transaction.create(pointClass, {
        parentId,
        attributeId: pnt.attr,
        pointId: pnt.pnt,
      }),
    );

    return transaction.save(pointEntities);
  }

  async update<T>(
    transaction: EntityManager,
    pointClass: EntityTarget<CommonPointEntity<T>>,
    parentId: string,
    points: CommonPointInput[] = [],
  ): Promise<Array<CommonPointEntity<T>>> {
    const existing = await transaction.find(pointClass, { where: { parentId } as any });

    const toDelete: number[] = [];
    const toInsert: CommonPointInput[] = [];

    const existingMap = new Map(
      existing.map(e => [`${e.attributeId}:${e.pointId}`, e]),
    );

    const inputSet = new Set<string>();

    for (const pnt of points) {
      const key = `${pnt.attr}:${pnt.pnt}`;
      inputSet.add(key);

      if (!existingMap.has(key)) {
        toInsert.push(pnt);
      }
    }

    for (const e of existing) {
      const key = `${e.attributeId}:${e.pointId}`;
      if (!inputSet.has(key)) {
        toDelete.push(e.id);
      }
    }

    if (toDelete.length > 0) {
      await transaction.delete(pointClass, toDelete);
    }

    if (toInsert.length > 0) {
      const entities = toInsert.map(
        pnt => transaction.create(pointClass, {
          parentId,
          attributeId: pnt.attr,
          pointId: pnt.pnt,
        }),
      );
      await transaction.save(entities);
    }

    return transaction.find(pointClass, { where: { parentId } as any });
  }

}
