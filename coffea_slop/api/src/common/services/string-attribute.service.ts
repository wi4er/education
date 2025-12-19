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

    const existingMap = new Map(
      existing.map(e => [`${e.attributeId}:${e.languageId ?? ''}`, e]),
    );

    const inputSet = new Set<string>();

    for (const str of strings) {
      const key = `${str.attr}:${str.lang ?? ''}`;
      inputSet.add(key);

      const found = existingMap.get(key);
      if (found) {
        if (found.value !== (str.value ?? '')) {
          toUpdate.push({ id: found.id, value: str.value });
        }
      } else {
        toInsert.push(str);
      }
    }

    for (const e of existing) {
      const key = `${e.attributeId}:${e.languageId ?? ''}`;
      if (!inputSet.has(key)) {
        toDelete.push(e.id);
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
