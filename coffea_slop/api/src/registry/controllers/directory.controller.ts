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
import { Directory } from '../entities/directory/directory.entity';
import { Directory2String } from '../entities/directory/directory2string.entity';
import { Directory2Point } from '../entities/directory/directory2point.entity';
import { Directory4Permission } from '../entities/directory/directory4permission.entity';
import { DirectoryView } from '../views/directory.view';
import { DirectoryInput } from '../inputs/directory.input';
import { PointAttributeService } from '../../common/services/point-attribute.service';
import { StringAttributeService } from '../../common/services/string-attribute.service';
import { PermissionAttributeService } from '../../common/services/permission-attribute.service';

@Controller('directory')
export class DirectoryController {

  constructor(
    @InjectRepository(Directory)
    private readonly directoryRepository: Repository<Directory>,
    private readonly dataSource: DataSource,
    private readonly pointAttributeService: PointAttributeService,
    private readonly stringAttributeService: StringAttributeService,
    private readonly permissionAttributeService: PermissionAttributeService,
  ) {}

  toView(directory: Directory): DirectoryView {
    return {
      id: directory.id,
      createdAt: directory.createdAt,
      updatedAt: directory.updatedAt,
      attributes: {
        strings: directory.strings?.map(str => ({
          lang: str.languageId,
          attr: str.attributeId,
          value: str.value,
        })) ?? [],
        points: directory.points?.map(pnt => ({
          attr: pnt.attributeId,
          point: pnt.pointId,
        })) ?? [],
      },
      permissions: directory.permissions?.map(perm => ({
        group: perm.groupId,
        method: perm.method,
      })) ?? [],
    };
  }

  @Get()
  @CheckMethodAccess(AccessEntity.DIRECTORY, AccessMethod.GET)
  async findAll(
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<DirectoryView[]> {
    const directories = await this.directoryRepository.find({
      relations: ['strings', 'points', 'permissions'],
      take: limit,
      skip: offset,
    });
    return directories.map(dir => this.toView(dir));
  }

  @Get(':id')
  @CheckId(Directory)
  @CheckMethodAccess(AccessEntity.DIRECTORY, AccessMethod.GET)
  async findOne(@Param('id') id: string): Promise<DirectoryView> {
    const directory = await this.directoryRepository.findOne({
      where: { id },
      relations: ['strings', 'points', 'permissions'],
    });
    return this.toView(directory);
  }

  @Post()
  @CheckMethodAccess(AccessEntity.DIRECTORY, AccessMethod.POST)
  async create(
    @Body()
    data: DirectoryInput
  ): Promise<DirectoryView> {
    const { strings, points, permissions, ...directoryData } = data;

    const directory = await this.dataSource.transaction(async transaction => {
      const dir = transaction.create(Directory, directoryData);
      const savedDirectory = await transaction.save(dir);

      await this.stringAttributeService.create<Directory>(transaction, Directory2String, strings);
      await this.pointAttributeService.create<Directory>(transaction, Directory2Point, points);
      await this.permissionAttributeService.create<Directory>(transaction, Directory4Permission, permissions);

      return transaction.findOne(Directory, {
        where: { id: savedDirectory.id },
        relations: ['strings', 'points', 'permissions'],
      });
    });

    return this.toView(directory);
  }

  @Put(':id')
  @CheckId(Directory)
  @CheckMethodAccess(AccessEntity.DIRECTORY, AccessMethod.PUT)
  async update(
    @Param('id')
    id: string,
    @Body()
    data: DirectoryInput,
  ): Promise<DirectoryView> {
    const { strings, points, permissions, ...directoryData } = data;

    const directory = await this.dataSource.transaction(async transaction => {
      await transaction.update(Directory, id, directoryData);

      await this.stringAttributeService.update<Directory>(transaction, Directory2String, id, strings);
      await this.pointAttributeService.update<Directory>(transaction, Directory2Point, id, points);
      await this.permissionAttributeService.update<Directory>(transaction, Directory4Permission, id, permissions);

      return transaction.findOne(Directory, {
        where: { id },
        relations: ['strings', 'points', 'permissions'],
      });
    });

    return this.toView(directory);
  }

  @Delete(':id')
  @CheckId(Directory)
  @CheckMethodAccess(AccessEntity.DIRECTORY, AccessMethod.DELETE)
  async remove(@Param('id') id: string): Promise<void> {
    await this.directoryRepository.delete(id);
  }

}
