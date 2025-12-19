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
    const toUpdate: Array<{ id: number; pointId: string }> = [];
    const toInsert: CommonPointInput[] = [];

    const existingMap = new Map(
      existing.map(e => [e.attributeId, e]),
    );

    const inputSet = new Set<string>();

    for (const pnt of points) {
      inputSet.add(pnt.attr);

      const found = existingMap.get(pnt.attr);
      if (found) {
        if (found.pointId !== pnt.pnt) {
          toUpdate.push({ id: found.id, pointId: pnt.pnt });
        }
      } else {
        toInsert.push(pnt);
      }
    }

    for (const e of existing) {
      if (!inputSet.has(e.attributeId)) {
        toDelete.push(e.id);
      }
    }

    if (toDelete.length > 0) {
      await transaction.delete(pointClass, toDelete);
    }

    for (const upd of toUpdate) {
      await transaction.update(pointClass, upd.id, { pointId: upd.pointId } as any);
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
