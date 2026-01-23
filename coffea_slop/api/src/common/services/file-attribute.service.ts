import { Injectable } from '@nestjs/common';
import { EntityManager, EntityTarget } from 'typeorm';
import { CommonFileEntity } from '../entities/common-file.entity';
import { CommonFileInput } from '../inputs/common-file.input';

@Injectable()
export class FileAttributeService {

  async create<T>(
    transaction: EntityManager,
    fileClass: EntityTarget<CommonFileEntity<T>>,
    parentId: string,
    files: CommonFileInput[] = [],
  ): Promise<Array<CommonFileEntity<T>>> {
    const fileEntities = files.map(f =>
      transaction.create(fileClass, {
        parentId,
        attributeId: f.attr,
        fileId: f.file,
      }),
    );

    return transaction.save(fileEntities);
  }

  async update<T>(
    transaction: EntityManager,
    fileClass: EntityTarget<CommonFileEntity<T>>,
    parentId: string,
    files: CommonFileInput[] = [],
  ): Promise<Array<CommonFileEntity<T>>> {
    const existing = await transaction.find(fileClass, {
      where: { parentId } as any,
    });

    const toDelete: number[] = [];
    const toInsert: CommonFileInput[] = [];

    const existingMap = new Map(
      existing.map(e => [`${e.attributeId}:${e.fileId}`, e]),
    );

    const inputSet = new Set<string>();

    for (const f of files) {
      const key = `${f.attr}:${f.file}`;
      inputSet.add(key);

      if (!existingMap.has(key)) {
        toInsert.push(f);
      }
    }

    for (const e of existing) {
      const key = `${e.attributeId}:${e.fileId}`;
      if (!inputSet.has(key)) {
        toDelete.push(e.id);
      }
    }

    if (toDelete.length > 0) {
      await transaction.delete(fileClass, toDelete);
    }

    if (toInsert.length > 0) {
      const entities = toInsert.map(f =>
        transaction.create(fileClass, {
          parentId,
          attributeId: f.attr,
          fileId: f.file,
        }),
      );
      await transaction.save(entities);
    }

    return transaction.find(fileClass, { where: { parentId } as any });
  }

}
