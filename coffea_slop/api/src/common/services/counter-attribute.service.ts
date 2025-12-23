import { Injectable } from '@nestjs/common';
import { EntityManager, EntityTarget } from 'typeorm';
import { CommonCounterEntity } from '../entities/common-counter.entity';
import { CommonCounterInput } from '../inputs/common-counter.input';

@Injectable()
export class CounterAttributeService {
  async create<T>(
    transaction: EntityManager,
    counterClass: EntityTarget<CommonCounterEntity<T>>,
    parentId: string,
    counters: CommonCounterInput[] = [],
  ): Promise<Array<CommonCounterEntity<T>>> {
    const counterEntities = counters.map((cnt) =>
      transaction.create(counterClass, {
        parentId,
        attributeId: cnt.attr,
        pointId: cnt.pnt,
        measureId: cnt.msr,
        count: cnt.count,
      }),
    );

    return transaction.save(counterEntities);
  }

  async update<T>(
    transaction: EntityManager,
    counterClass: EntityTarget<CommonCounterEntity<T>>,
    parentId: string,
    counters: CommonCounterInput[] = [],
  ): Promise<Array<CommonCounterEntity<T>>> {
    const existing = await transaction.find(counterClass, {
      where: { parentId } as any,
    });

    const toDelete: number[] = [];
    const toUpdate: Array<{ id: number; count: number; measureId?: string }> =
      [];
    const toInsert: CommonCounterInput[] = [];

    const existingMap = new Map(
      existing.map((e) => [`${e.attributeId}:${e.pointId ?? ''}`, e]),
    );

    const inputSet = new Set<string>();

    for (const cnt of counters) {
      const key = `${cnt.attr}:${cnt.pnt ?? ''}`;
      inputSet.add(key);

      const found = existingMap.get(key);
      if (found) {
        if (
          found.count !== cnt.count ||
          found.measureId !== (cnt.msr ?? null)
        ) {
          toUpdate.push({ id: found.id, count: cnt.count, measureId: cnt.msr });
        }
      } else {
        toInsert.push(cnt);
      }
    }

    for (const e of existing) {
      const key = `${e.attributeId}:${e.pointId ?? ''}`;
      if (!inputSet.has(key)) {
        toDelete.push(e.id);
      }
    }

    if (toDelete.length > 0) {
      await transaction.delete(counterClass, toDelete);
    }

    for (const upd of toUpdate) {
      await transaction.update(counterClass, upd.id, {
        count: upd.count,
        measureId: upd.measureId,
      } as any);
    }

    if (toInsert.length > 0) {
      const entities = toInsert.map((cnt) =>
        transaction.create(counterClass, {
          parentId,
          attributeId: cnt.attr,
          pointId: cnt.pnt,
          measureId: cnt.msr,
          count: cnt.count,
        }),
      );
      await transaction.save(entities);
    }

    return transaction.find(counterClass, { where: { parentId } as any });
  }
}
