import { Injectable } from '@nestjs/common';
import { EntityManager, EntityTarget } from 'typeorm';
import { CommonDescriptionEntity } from '../entities/common-description.entity';
import { CommonDescriptionInput } from '../inputs/common-description.input';

@Injectable()
export class DescriptionAttributeService {

  async create<T>(
    transaction: EntityManager,
    descriptionClass: EntityTarget<CommonDescriptionEntity<T>>,
    descriptions: CommonDescriptionInput[] = [],
  ): Promise<Array<CommonDescriptionEntity<T>>> {
    const descriptionEntities = descriptions.map(
      desc => transaction.create(
        descriptionClass,
        desc
      ),
    );

    return transaction.save(descriptionEntities);
  }

  async update<T>(
    transaction: EntityManager,
    descriptionClass: EntityTarget<CommonDescriptionEntity<T>>,
    parentId: string,
    descriptions: CommonDescriptionInput[] = [],
  ): Promise<Array<CommonDescriptionEntity<T>>> {
    await transaction.delete(descriptionClass, { parentId });

    const descriptionEntities = descriptions.map(
      desc => transaction.create(
        descriptionClass,
        {
          ...desc,
          parentId,
        },
      ),
    );

    return transaction.save(descriptionEntities);
  }

}
