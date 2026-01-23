import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { Attribute2AsPoint } from '../entities/attribute/attributeAsPoint.entity';

@Injectable()
export class AsPointService {

  async create(
    transaction: EntityManager,
    parentId: string,
    directoryId?: string,
  ): Promise<Attribute2AsPoint | null> {
    if (!directoryId) {
      return null;
    }

    const entity = transaction.create(Attribute2AsPoint, {
      parentId,
      directoryId,
    });

    return transaction.save(entity);
  }

  async update(
    transaction: EntityManager,
    parentId: string,
    directoryId?: string,
  ): Promise<Attribute2AsPoint | null> {
    const existing = await transaction.findOne(Attribute2AsPoint, {
      where: { parentId },
    });

    if (directoryId) {
      if (existing) {
        if (existing.directoryId !== directoryId) {
          await transaction.update(Attribute2AsPoint, existing.id, {
            directoryId,
          });
        }
      } else {
        const entity = transaction.create(Attribute2AsPoint, {
          parentId,
          directoryId,
        });
        await transaction.save(entity);
      }
    } else if (existing) {
      await transaction.delete(Attribute2AsPoint, existing.id);
    }

    return transaction.findOne(Attribute2AsPoint, { where: { parentId } });
  }

}
