import {Injectable} from '@nestjs/common';
import {EntityManager, EntityTarget} from 'typeorm';
import {CommonDescriptionEntity} from '../entities/common-description.entity';
import {CommonDescriptionInput} from '../inputs/common-description.input';

@Injectable()
export class DescriptionAttributeService {
  async create<T>(
    transaction: EntityManager,
    descriptionClass: EntityTarget<CommonDescriptionEntity<T>>,
    parentId: string,
    descriptions: CommonDescriptionInput[] = [],
  ): Promise<Array<CommonDescriptionEntity<T>>> {
    const descriptionEntities = descriptions.map((desc) =>
      transaction.create(descriptionClass, {
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
    const existing = await transaction.find(descriptionClass, {
      where: { parentId } as any,
    });

    const toDelete: number[] = [];
    const toUpdate: Array<{ id: number; value: string }> = [];
    const toInsert: CommonDescriptionInput[] = [];

    const existingByKey = new Map<string, Array<CommonDescriptionEntity<T>>>();
    for (const e of existing) {
      const key = `${e.attributeId}:${e.languageId ?? ''}`;
      if (!existingByKey.has(key)) existingByKey.set(key, []);
      existingByKey.get(key)!.push(e);
    }

    const inputByKey = new Map<string, CommonDescriptionInput[]>();
    for (const desc of descriptions) {
      const key = `${desc.attr}:${desc.lang ?? ''}`;
      if (!inputByKey.has(key)) inputByKey.set(key, []);
      inputByKey.get(key)!.push(desc);
    }

    for (const [key, existingItems] of existingByKey) {
      const inputItems = inputByKey.get(key) || [];

      for (let i = 0; i < existingItems.length; i++) {
        if (i < inputItems.length) {
          if (existingItems[i].value !== inputItems[i].value) {
            toUpdate.push({
              id: existingItems[i].id,
              value: inputItems[i].value,
            });
          }
        } else {
          toDelete.push(existingItems[i].id);
        }
      }
    }

    for (const [key, inputItems] of inputByKey) {
      const existingItems = existingByKey.get(key) || [];

      for (let i = existingItems.length; i < inputItems.length; i++) {
        toInsert.push(inputItems[i]);
      }
    }

    if (toDelete.length > 0) {
      await transaction.delete(descriptionClass, toDelete);
    }

    for (const upd of toUpdate) {
      await transaction.update(descriptionClass, upd.id, {
        value: upd.value,
      } as any);
    }

    if (toInsert.length > 0) {
      const entities = toInsert.map((desc) =>
        transaction.create(descriptionClass, {
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
