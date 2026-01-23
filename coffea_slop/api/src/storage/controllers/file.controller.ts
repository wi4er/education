import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode } from '@nestjs/common';
import { CheckId } from '../../common/check-id/check-id.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In, Or, IsNull } from 'typeorm';
import { File } from '../entities/file/file.entity';
import { File2String } from '../entities/file/file2string.entity';
import { File2Point } from '../entities/file/file2point.entity';
import { File4Status } from '../entities/file/file4status.entity';
import { FileView } from '../views/file.view';
import { FileInput } from '../inputs/file.input';
import { PointAttributeService } from '../../common/services/point-attribute.service';
import { StringAttributeService } from '../../common/services/string-attribute.service';
import { StatusService } from '../../common/services/status.service';
import { CheckParentPermission } from '../../common/permission/check-parent-permission.guard';
import { CheckInputPermission } from '../../common/permission/check-input-permission.guard';
import { PermissionMethod } from '../../common/permission/permission.method';
import { CurrentGroups } from '../../personal/decorators/current-groups.decorator';
import { Collection } from '../entities/collection/collection.entity';

@Controller('file')
export class FileController {

  private readonly relations = ['strings', 'points', 'statuses'];

  constructor(
    @InjectRepository(File)
    private readonly fileRepository: Repository<File>,
    private readonly dataSource: DataSource,
    private readonly pointAttributeService: PointAttributeService,
    private readonly stringAttributeService: StringAttributeService,
    private readonly statusService: StatusService,
  ) {}

  toView(file: File): FileView {
    return {
      id: file.id,
      parentId: file.parentId,
      path: file.path,
      original: file.original,
      createdAt: file.createdAt,
      updatedAt: file.updatedAt,
      attributes: {
        strings:
          file.strings?.map(str => ({
            lang: str.languageId,
            attr: str.attributeId,
            value: str.value,
          })) ?? [],
        points:
          file.points?.map(pnt => ({
            attr: pnt.attributeId,
            pnt: pnt.pointId,
          })) ?? [],
      },
      status: file.statuses?.map(s => s.statusId) ?? [],
    };
  }

  @Get()
  async findAll(
    @CurrentGroups()
    groups: string[],
    @Query('limit')
    limit?: number,
    @Query('offset')
    offset?: number,
  ): Promise<{ data: FileView[]; count: number }> {
    const [files, count] = await this.fileRepository.findAndCount({
      where: {
        parent: {
          permissions: {
            method: In([PermissionMethod.READ, PermissionMethod.ALL]),
            groupId: Or(IsNull(), In(groups)),
          },
        }
      },
      relations: this.relations,
      take: limit,
      skip: offset,
    });

    return {
      data: files.map(file => this.toView(file)),
      count,
    };
  }

  @Get(':id')
  @CheckId(File)
  @CheckParentPermission(File, PermissionMethod.READ)
  async findOne(
    @Param('id')
    id: string,
  ): Promise<FileView> {
    const file = await this.fileRepository.findOne({
      where: { id },
      relations: this.relations,
    });
    return this.toView(file);
  }

  @Post()
  @CheckInputPermission(Collection, PermissionMethod.WRITE, 'parentId')
  async create(
    @Body()
    data: FileInput,
  ): Promise<FileView> {
    const { strings, points, status, ...fileData } = data;

    const file = await this.dataSource.transaction(async transaction => {
      const f = transaction.create(File, fileData);
      const savedFile = await transaction.save(f);

      await this.stringAttributeService.create<File>(transaction, File2String, savedFile.id, strings);
      await this.pointAttributeService.create<File>(transaction, File2Point, savedFile.id, points);
      await this.statusService.create<File>(transaction, File4Status, savedFile.id, status);

      return transaction.findOne(File, {
        where: { id: savedFile.id },
        relations: this.relations,
      });
    });

    return this.toView(file);
  }

  @Put(':id')
  @CheckId(File)
  @CheckParentPermission(File, PermissionMethod.WRITE)
  async update(
    @Param('id')
    id: string,
    @Body()
    data: FileInput,
  ): Promise<FileView> {
    const { strings, points, status, ...fileData } = data;

    const file = await this.dataSource.transaction(async transaction => {
      await transaction.update(File, id, fileData);

      await this.stringAttributeService.update<File>(transaction, File2String, id, strings);
      await this.pointAttributeService.update<File>(transaction, File2Point, id, points);
      await this.statusService.update<File>(transaction, File4Status, id, status);

      return transaction.findOne(File, {
        where: { id },
        relations: this.relations,
      });
    });

    return this.toView(file);
  }

  @Delete(':id')
  @HttpCode(204)
  @CheckId(File)
  @CheckParentPermission(File, PermissionMethod.DELETE)
  async remove(
    @Param('id')
    id: string,
  ): Promise<{ data: FileView; deletedAt: string }> {
    const file = await this.fileRepository.findOne({
      where: { id },
      relations: this.relations,
    });

    await this.fileRepository.delete(id);

    return {
      data: this.toView(file),
      deletedAt: new Date().toISOString(),
    };
  }

}
