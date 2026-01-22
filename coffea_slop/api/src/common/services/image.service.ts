import {Injectable} from '@nestjs/common';
import {EntityManager, EntityTarget} from 'typeorm';
import {CommonImageEntity} from '../entities/common-image.entity';

@Injectable()
export class ImageService {

  async create<T>(
    transaction: EntityManager,
    imageClass: EntityTarget<CommonImageEntity<T>>,
    parentId: string,
    images: string[] = [],
  ): Promise<Array<CommonImageEntity<T>>> {
    if (!images?.length) {
      return [];
    }

    const entities = images.map(fileId =>
      transaction.create(imageClass, { parentId, fileId }),
    );

    return transaction.save(entities);
  }

  async update<T>(
    transaction: EntityManager,
    imageClass: EntityTarget<CommonImageEntity<T>>,
    parentId: string,
    images: string[] = [],
  ): Promise<Array<CommonImageEntity<T>>> {
    await transaction.delete(imageClass, { parentId } as any);

    if (!images?.length) {
      return [];
    }

    const entities = images.map(fileId =>
      transaction.create(imageClass, { parentId, fileId }),
    );

    return transaction.save(entities);
  }

}
