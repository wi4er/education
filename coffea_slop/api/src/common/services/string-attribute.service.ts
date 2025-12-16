import { Injectable } from '@nestjs/common';
import { EntityManager, EntityTarget } from 'typeorm';
import { CommonStringEntity } from '../entities/common-string.entity';
import { CommonStringInput } from '../inputs/common-string.input';

@Injectable()
export class StringAttributeService {

  async create<T>(
    transaction: EntityManager,
    stringClass: EntityTarget<CommonStringEntity<T>>,
    strings: CommonStringInput[] = [],
  ): Promise<Array<CommonStringEntity<T>>> {
    const stringEntities = strings.map(
      str => transaction.create(stringClass, str),
    );

    return transaction.save(stringEntities);
  }

  async update<T>(
    transaction: EntityManager,
    stringClass: EntityTarget<CommonStringEntity<T>>,
    parentId: string,
    strings: CommonStringInput[] = [],
  ): Promise<Array<CommonStringEntity<T>>> {
    await transaction.delete(stringClass, { parentId });

    const stringEntities = strings.map(
      str => transaction.create(stringClass, { ...str, parentId }),
    );

    return transaction.save(stringEntities);
  }

}
