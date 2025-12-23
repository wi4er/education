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
import { CheckIdPermission } from '../../common/permission/check-id-permission.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In, IsNull, Or } from 'typeorm';
import { CurrentGroups } from '../../personal/decorators/current-groups.decorator';
import { PermissionMethod } from '../../common/permission/permission.method';
import { Directory } from '../entities/directory/directory.entity';
import { Directory2String } from '../entities/directory/directory2string.entity';
import { Directory2Point } from '../entities/directory/directory2point.entity';
import { Directory4Permission } from '../entities/directory/directory4permission.entity';
import { Directory4Status } from '../entities/directory/directory4status.entity';
import { DirectoryView } from '../views/directory.view';
import { DirectoryInput } from '../inputs/directory.input';
import { PointAttributeService } from '../../common/services/point-attribute.service';
import { StringAttributeService } from '../../common/services/string-attribute.service';
import { PermissionService } from '../../common/services/permission.service';
import { StatusService } from '../../common/services/status.service';

@Controller('directory')
export class DirectoryController {
  constructor(
    @InjectRepository(Directory)
    private readonly directoryRepository: Repository<Directory>,
    private readonly dataSource: DataSource,
    private readonly pointAttributeService: PointAttributeService,
    private readonly stringAttributeService: StringAttributeService,
    private readonly permissionService: PermissionService,
    private readonly statusService: StatusService,
  ) {}

  toView(directory: Directory): DirectoryView {
    return {
      id: directory.id,
      createdAt: directory.createdAt,
      updatedAt: directory.updatedAt,
      attributes: {
        strings:
          directory.strings?.map((str) => ({
            lang: str.languageId,
            attr: str.attributeId,
            value: str.value,
          })) ?? [],
        points:
          directory.points?.map((pnt) => ({
            attr: pnt.attributeId,
            pnt: pnt.pointId,
          })) ?? [],
      },
      permissions:
        directory.permissions?.map((perm) => ({
          group: perm.groupId,
          method: perm.method,
        })) ?? [],
      status: directory.statuses?.map((s) => s.statusId) ?? [],
    };
  }

  @Get()
  @CheckMethodAccess(AccessEntity.DIRECTORY, AccessMethod.GET)
  async findAll(
    @CurrentGroups()
    groups: string[],
    @Query('limit')
    limit?: number,
    @Query('offset')
    offset?: number,
  ): Promise<DirectoryView[]> {
    const directories = await this.directoryRepository.find({
      where: {
        permissions: {
          groupId: Or(In(groups), IsNull()),
          method: In([PermissionMethod.READ, PermissionMethod.ALL]),
        },
      },
      relations: ['strings', 'points', 'permissions', 'statuses'],
      take: limit,
      skip: offset,
    });
    return directories.map((dir) => this.toView(dir));
  }

  @Get(':id')
  @CheckId(Directory)
  @CheckMethodAccess(AccessEntity.DIRECTORY, AccessMethod.GET)
  @CheckIdPermission(Directory, PermissionMethod.READ)
  async findOne(
    @Param('id')
    id: string,
  ): Promise<DirectoryView> {
    const directory = await this.directoryRepository.findOne({
      where: { id },
      relations: ['strings', 'points', 'permissions', 'statuses'],
    });
    return this.toView(directory);
  }

  @Post()
  @CheckMethodAccess(AccessEntity.DIRECTORY, AccessMethod.POST)
  async create(
    @Body()
    data: DirectoryInput,
  ): Promise<DirectoryView> {
    const { strings, points, permissions, status, ...directoryData } = data;

    const directory = await this.dataSource.transaction(async (transaction) => {
      const dir = transaction.create(Directory, directoryData);
      const savedDirectory = await transaction.save(dir);

      await this.stringAttributeService.create<Directory>(
        transaction,
        Directory2String,
        savedDirectory.id,
        strings,
      );
      await this.pointAttributeService.create<Directory>(
        transaction,
        Directory2Point,
        savedDirectory.id,
        points,
      );
      await this.permissionService.create<Directory>(
        transaction,
        Directory4Permission,
        permissions,
        savedDirectory.id,
      );
      await this.statusService.create<Directory>(
        transaction,
        Directory4Status,
        savedDirectory.id,
        status,
      );

      return transaction.findOne(Directory, {
        where: { id: savedDirectory.id },
        relations: ['strings', 'points', 'permissions', 'statuses'],
      });
    });

    return this.toView(directory);
  }

  @Put(':id')
  @CheckId(Directory)
  @CheckMethodAccess(AccessEntity.DIRECTORY, AccessMethod.PUT)
  @CheckIdPermission(Directory, PermissionMethod.WRITE)
  async update(
    @Param('id')
    id: string,
    @Body()
    data: DirectoryInput,
  ): Promise<DirectoryView> {
    const { strings, points, permissions, status, ...directoryData } = data;

    const directory = await this.dataSource.transaction(async (transaction) => {
      await transaction.update(Directory, id, directoryData);

      await this.stringAttributeService.update<Directory>(
        transaction,
        Directory2String,
        id,
        strings,
      );
      await this.pointAttributeService.update<Directory>(
        transaction,
        Directory2Point,
        id,
        points,
      );
      await this.permissionService.update<Directory>(
        transaction,
        Directory4Permission,
        id,
        permissions,
      );
      await this.statusService.update<Directory>(
        transaction,
        Directory4Status,
        id,
        status,
      );

      return transaction.findOne(Directory, {
        where: { id },
        relations: ['strings', 'points', 'permissions', 'statuses'],
      });
    });

    return this.toView(directory);
  }

  @Delete(':id')
  @CheckId(Directory)
  @CheckMethodAccess(AccessEntity.DIRECTORY, AccessMethod.DELETE)
  @CheckIdPermission(Directory, PermissionMethod.DELETE)
  async remove(
    @Param('id')
    id: string,
  ): Promise<void> {
    await this.directoryRepository.delete(id);
  }
}
