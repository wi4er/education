import { Injectable } from '@nestjs/common';
import { EntityManager, EntityTarget } from 'typeorm';
import { CommonPointEntity } from '../entities/common-point.entity';
import { CommonPointInput } from '../inputs/common-point.input';

@Injectable()
export class PointAttributeService {

  async create<T>(
    transaction: EntityManager,
    pointClass: EntityTarget<CommonPointEntity<T>>,
    points: CommonPointInput[] = [],
  ): Promise<Array<CommonPointEntity<T>>> {
    const pointEntities = points.map(
      pnt => transaction.create(
        pointClass,
        pnt,
      ),
    );

    return transaction.save(pointEntities);
  }

  async update<T>(
    transaction: EntityManager,
    pointClass: EntityTarget<CommonPointEntity<T>>,
    parentId: string,
    points: CommonPointInput[] = [],
  ): Promise<Array<CommonPointEntity<T>>> {
    await transaction.delete(pointClass, { parentId });

    const pointEntities = points.map(
      pnt => transaction.create(
        pointClass,
        {
          ...pnt,
          parentId,
        },
      ),
    );

    return transaction.save(pointEntities);
  }

}
