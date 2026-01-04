import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { CheckMethodAccess } from '../../common/access/check-method-access.guard';
import { AccessEntity } from '../../common/access/access-entity.enum';
import { AccessMethod } from '../../personal/entities/access/access-method.enum';
import { CheckId } from '../../common/check-id/check-id.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Collection } from '../entities/collection/collection.entity';
import { Collection2String } from '../entities/collection/collection2string.entity';
import { Collection2Point } from '../entities/collection/collection2point.entity';
import { Collection4Permission } from '../entities/collection/collection4permission.entity';
import { Collection4Status } from '../entities/collection/collection4status.entity';
import { CollectionView } from '../views/collection.view';
import { CollectionInput } from '../inputs/collection.input';
import { PointAttributeService } from '../../common/services/point-attribute.service';
import { StringAttributeService } from '../../common/services/string-attribute.service';
import { PermissionService } from '../../common/services/permission.service';
import { StatusService } from '../../common/services/status.service';
import { CurrentGroups } from '../../personal/decorators/current-groups.decorator';
import { CheckIdPermission } from '../../common/permission/check-id-permission.guard';
import { PermissionMethod } from '../../common/permission/permission.method';
import { In, IsNull, Or } from 'typeorm';

@Controller('collection')
export class CollectionController {

  private readonly relations = ['strings', 'points', 'permissions', 'statuses'];

  constructor(
    @InjectRepository(Collection)
    private readonly collectionRepository: Repository<Collection>,
    private readonly dataSource: DataSource,
    private readonly pointAttributeService: PointAttributeService,
    private readonly stringAttributeService: StringAttributeService,
    private readonly permissionService: PermissionService,
    private readonly statusService: StatusService,
  ) {}

  toView(collection: Collection): CollectionView {
    return {
      id: collection.id,
      createdAt: collection.createdAt,
      updatedAt: collection.updatedAt,
      attributes: {
        strings:
          collection.strings?.map(str => ({
            lang: str.languageId,
            attr: str.attributeId,
            value: str.value,
          })) ?? [],
        points:
          collection.points?.map(pnt => ({
            attr: pnt.attributeId,
            pnt: pnt.pointId,
          })) ?? [],
      },
      permissions:
        collection.permissions?.map(perm => ({
          group: perm.groupId,
          method: perm.method,
        })) ?? [],
      status: collection.statuses?.map(s => s.statusId) ?? [],
    };
  }

  @Get()
  @CheckMethodAccess(AccessEntity.COLLECTION, AccessMethod.GET)
  async findAll(
    @CurrentGroups()
    groups: string[],
    @Query('limit')
    limit?: number,
    @Query('offset')
    offset?: number,
  ): Promise<CollectionView[]> {
    const collections = await this.collectionRepository.find({
      where: {
        permissions: {
          groupId: Or(In(groups), IsNull()),
          method: In([PermissionMethod.READ, PermissionMethod.ALL]),
        },
      },
      relations: this.relations,
      take: limit,
      skip: offset,
    });
    return collections.map(col => this.toView(col));
  }

  @Get(':id')
  @CheckId(Collection)
  @CheckMethodAccess(AccessEntity.COLLECTION, AccessMethod.GET)
  @CheckIdPermission(Collection, PermissionMethod.READ)
  async findOne(
    @Param('id')
    id: string,
  ): Promise<CollectionView> {
    const collection = await this.collectionRepository.findOne({
      where: { id },
      relations: this.relations,
    });
    return this.toView(collection);
  }

  @Post()
  @CheckMethodAccess(AccessEntity.COLLECTION, AccessMethod.POST)
  async create(
    @Body()
    data: CollectionInput,
  ): Promise<CollectionView> {
    const { strings, points, permissions, status, ...collectionData } = data;

    const collection = await this.dataSource.transaction(async transaction => {
      const col = transaction.create(Collection, collectionData);
      const saved = await transaction.save(col);

      await this.stringAttributeService.create<Collection>(transaction, Collection2String, saved.id, strings);
      await this.pointAttributeService.create<Collection>(transaction, Collection2Point, saved.id, points);
      await this.permissionService.create<Collection>(transaction, Collection4Permission, permissions, saved.id);
      await this.statusService.create<Collection>(transaction, Collection4Status, saved.id, status);

      return transaction.findOne(Collection, {
        where: { id: saved.id },
        relations: this.relations,
      });
    });

    return this.toView(collection);
  }

  @Put(':id')
  @CheckId(Collection)
  @CheckMethodAccess(AccessEntity.COLLECTION, AccessMethod.PUT)
  @CheckIdPermission(Collection, PermissionMethod.WRITE)
  async update(
    @Param('id')
    id: string,
    @Body()
    data: CollectionInput,
  ): Promise<CollectionView> {
    const { strings, points, permissions, status, ...collectionData } = data;

    const collection = await this.dataSource.transaction(async transaction => {
      await transaction.update(Collection, id, collectionData);

      await this.stringAttributeService.update<Collection>(transaction, Collection2String, id, strings);
      await this.pointAttributeService.update<Collection>(transaction, Collection2Point, id, points);
      await this.permissionService.update<Collection>(transaction, Collection4Permission, id, permissions);
      await this.statusService.update<Collection>(transaction, Collection4Status, id, status);

      return transaction.findOne(Collection, {
        where: { id },
        relations: this.relations,
      });
    });

    return this.toView(collection);
  }

  @Delete(':id')
  @CheckId(Collection)
  @CheckMethodAccess(AccessEntity.COLLECTION, AccessMethod.DELETE)
  @CheckIdPermission(Collection, PermissionMethod.DELETE)
  async remove(
    @Param('id')
    id: string,
  ): Promise<void> {
    await this.collectionRepository.delete(id);
  }

}
