import { Injectable } from '@nestjs/common';
import { EntityManager, EntityTarget } from 'typeorm';
import { CommonStringEntity } from '../entities/common-string.entity';
import { CommonStringInput } from '../inputs/common-string.input';

@Injectable()
export class StringAttributeService {

  async create<T>(
    transaction: EntityManager,
    stringClass: EntityTarget<CommonStringEntity<T>>,
    parentId: string,
    strings: CommonStringInput[] = [],
  ): Promise<Array<CommonStringEntity<T>>> {
    const stringEntities = strings.map(
      str => transaction.create(stringClass, {
        parentId,
        attributeId: str.attr,
        languageId: str.lang,
        value: str.value,
      }),
    );

    return transaction.save(stringEntities);
  }

  async update<T>(
    transaction: EntityManager,
    stringClass: EntityTarget<CommonStringEntity<T>>,
    parentId: string,
    strings: CommonStringInput[] = [],
  ): Promise<Array<CommonStringEntity<T>>> {
    const existing = await transaction.find(stringClass, { where: { parentId } as any });

    const toDelete: number[] = [];
    const toUpdate: Array<{ id: number; value?: string }> = [];
    const toInsert: CommonStringInput[] = [];

    const existingByKey = new Map<string, Array<CommonStringEntity<T>>>();
    for (const e of existing) {
      const key = `${e.attributeId}:${e.languageId ?? ''}`;
      if (!existingByKey.has(key)) existingByKey.set(key, []);
      existingByKey.get(key)!.push(e);
    }

    const inputByKey = new Map<string, CommonStringInput[]>();
    for (const str of strings) {
      const key = `${str.attr}:${str.lang ?? ''}`;
      if (!inputByKey.has(key)) inputByKey.set(key, []);
      inputByKey.get(key)!.push(str);
    }

    for (const [key, existingItems] of existingByKey) {
      const inputItems = inputByKey.get(key) || [];

      for (let i = 0; i < existingItems.length; i++) {
        if (i < inputItems.length) {
          if (existingItems[i].value !== (inputItems[i].value ?? '')) {
            toUpdate.push({ id: existingItems[i].id, value: inputItems[i].value });
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
      await transaction.delete(stringClass, toDelete);
    }

    for (const upd of toUpdate) {
      await transaction.update(stringClass, upd.id, { value: upd.value } as any);
    }

    if (toInsert.length > 0) {
      const entities = toInsert.map(
        str => transaction.create(stringClass, {
          parentId,
          attributeId: str.attr,
          languageId: str.lang,
          value: str.value,
        }),
      );
      await transaction.save(entities);
    }

    return transaction.find(stringClass, { where: { parentId } as any });
  }

}
