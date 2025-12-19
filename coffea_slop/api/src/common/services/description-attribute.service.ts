import { Injectable } from '@nestjs/common';
import { EntityManager, EntityTarget } from 'typeorm';
import { CommonDescriptionEntity } from '../entities/common-description.entity';
import { CommonDescriptionInput } from '../inputs/common-description.input';

@Injectable()
export class DescriptionAttributeService {

  async create<T>(
    transaction: EntityManager,
    descriptionClass: EntityTarget<CommonDescriptionEntity<T>>,
    parentId: string,
    descriptions: CommonDescriptionInput[] = [],
  ): Promise<Array<CommonDescriptionEntity<T>>> {
    const descriptionEntities = descriptions.map(
      desc => transaction.create(descriptionClass, {
        parentId,
        attributeId: desc.attr,
        languageId: desc.lang,
        value: desc.value,
      }),
    );

    return transaction.save(descriptionEntities);
  }

  async update<T>(
    transaction: EntityManager,
    descriptionClass: EntityTarget<CommonDescriptionEntity<T>>,
    parentId: string,
    descriptions: CommonDescriptionInput[] = [],
  ): Promise<Array<CommonDescriptionEntity<T>>> {
    const existing = await transaction.find(descriptionClass, { where: { parentId } as any });

    const toDelete: number[] = [];
    const toUpdate: Array<{ id: number; value: string }> = [];
    const toInsert: CommonDescriptionInput[] = [];

    const existingMap = new Map(
      existing.map(e => [`${e.attributeId}:${e.languageId ?? ''}`, e]),
    );

    const inputSet = new Set<string>();

    for (const desc of descriptions) {
      const key = `${desc.attr}:${desc.lang ?? ''}`;
      inputSet.add(key);

      const found = existingMap.get(key);
      if (found) {
        if (found.value !== desc.value) {
          toUpdate.push({ id: found.id, value: desc.value });
        }
      } else {
        toInsert.push(desc);
      }
    }

    for (const e of existing) {
      const key = `${e.attributeId}:${e.languageId ?? ''}`;
      if (!inputSet.has(key)) {
        toDelete.push(e.id);
      }
    }

    if (toDelete.length > 0) {
      await transaction.delete(descriptionClass, toDelete);
    }

    for (const upd of toUpdate) {
      await transaction.update(descriptionClass, upd.id, { value: upd.value } as any);
    }

    if (toInsert.length > 0) {
      const entities = toInsert.map(
        desc => transaction.create(descriptionClass, {
          parentId,
          attributeId: desc.attr,
          languageId: desc.lang,
          value: desc.value,
        }),
      );
      await transaction.save(entities);
    }

    return transaction.find(descriptionClass, { where: { parentId } as any });
  }

}
