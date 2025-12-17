import { Injectable } from '@nestjs/common';
import { EntityManager, EntityTarget } from 'typeorm';
import { CommonCounterEntity } from '../entities/common-counter.entity';
import { CommonCounterInput } from '../inputs/common-counter.input';

@Injectable()
export class CounterAttributeService {

  async create<T>(
    transaction: EntityManager,
    counterClass: EntityTarget<CommonCounterEntity<T>>,
    counters: CommonCounterInput[] = [],
  ): Promise<Array<CommonCounterEntity<T>>> {
    const counterEntities = counters.map(
      cnt => transaction.create(
        counterClass,
        cnt,
      ),
    );

    return transaction.save(counterEntities);
  }

  async update<T>(
    transaction: EntityManager,
    counterClass: EntityTarget<CommonCounterEntity<T>>,
    parentId: string,
    counters: CommonCounterInput[] = [],
  ): Promise<Array<CommonCounterEntity<T>>> {
    await transaction.delete(counterClass, { parentId });

    const counterEntities = counters.map(
      cnt => transaction.create(
        counterClass,
        {
          ...cnt,
          parentId,
        },
      ),
    );

    return transaction.save(counterEntities);
  }

}
