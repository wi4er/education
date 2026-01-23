import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
} from '@nestjs/common';
import { CheckMethodAccess } from '../../common/access/check-method-access.guard';
import { AccessEntity } from '../../common/access/access-entity.enum';
import { AccessMethod } from '../../personal/entities/access/access-method.enum';
import { CheckId } from '../../common/check-id/check-id.guard';
import { CheckIdPermission } from '../../common/permission/check-id-permission.guard';
import { PermissionMethod } from '../../common/permission/permission.method';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In, IsNull, Or } from 'typeorm';
import { CurrentGroups } from '../../personal/decorators/current-groups.decorator';
import { Block } from '../entities/block/block.entity';
import { Block2String } from '../entities/block/block2string.entity';
import { Block2Point } from '../entities/block/block2point.entity';
import { Block2Description } from '../entities/block/block2description.entity';
import { Block2Counter } from '../entities/block/block2counter.entity';
import { Block2File } from '../entities/block/block2file.entity';
import { BlockView } from '../views/block.view';
import { BlockInput } from '../inputs/block.input';
import { PointAttributeService } from '../../common/services/point-attribute.service';
import { StringAttributeService } from '../../common/services/string-attribute.service';
import { PermissionService } from '../../common/services/permission.service';
import { DescriptionAttributeService } from '../../common/services/description-attribute.service';
import { CounterAttributeService } from '../../common/services/counter-attribute.service';
import { FileAttributeService } from '../../common/services/file-attribute.service';
import { StatusService } from '../../common/services/status.service';
import { Block4Permission } from '../entities/block/block4permission.entity';
import { Block4Status } from '../entities/block/block4status.entity';
import { Block4Image } from '../entities/block/block4image.entity';
import { ImageService } from '../../common/services/image.service';

@Controller('block')
export class BlockController {

  private readonly relations = [
    'strings',
    'points',
    'permissions',
    'descriptions',
    'counters',
    'files',
    'images',
    'statuses',
  ];

  constructor(
    @InjectRepository(Block)
    private readonly blockRepository: Repository<Block>,
    private readonly dataSource: DataSource,
    private readonly pointAttributeService: PointAttributeService,
    private readonly stringAttributeService: StringAttributeService,
    private readonly permissionService: PermissionService,
    private readonly descriptionAttributeService: DescriptionAttributeService,
    private readonly counterAttributeService: CounterAttributeService,
    private readonly fileAttributeService: FileAttributeService,
    private readonly imageService: ImageService,
    private readonly statusService: StatusService,
  ) {
  }

  toView(block: Block): BlockView {
    return {
      id: block.id,
      createdAt: block.createdAt,
      updatedAt: block.updatedAt,
      attributes: {
        strings: block.strings?.map((str) => ({
          lang: str.languageId,
          attr: str.attributeId,
          value: str.value,
        })) ?? [],
        points: block.points?.map((pnt) => ({
          attr: pnt.attributeId,
          pnt: pnt.pointId,
        })) ?? [],
        descriptions: block.descriptions?.map((desc) => ({
          lang: desc.languageId,
          attr: desc.attributeId,
          value: desc.value,
        })) ?? [],
        counters: block.counters?.map((cnt) => ({
          attr: cnt.attributeId,
          pnt: cnt.pointId,
          msr: cnt.measureId,
          count: cnt.count,
        })) ?? [],
        files: block.files?.map((f) => ({
          attr: f.attributeId,
          file: f.fileId,
        })) ?? [],
      },
      permissions:
        block.permissions?.map((perm) => ({
          group: perm.groupId,
          method: perm.method,
        })) ?? [],
      images: block.images?.map((img) => img.fileId) ?? [],
      status: block.statuses?.map((s) => s.statusId) ?? [],
    };
  }

  @Get()
  @CheckMethodAccess(AccessEntity.BLOCK, AccessMethod.GET)
  async findAll(
    @CurrentGroups()
    groups: string[],
    @Query('limit')
    limit?: number,
    @Query('offset')
    offset?: number,
  ): Promise<{ data: BlockView[]; count: number }> {
    const [blocks, count] = await this.blockRepository.findAndCount({
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

    return {
      data: blocks.map((block) => this.toView(block)),
      count,
    };
  }

  @Get(':id')
  @CheckId(Block)
  @CheckMethodAccess(AccessEntity.BLOCK, AccessMethod.GET)
  @CheckIdPermission(Block, PermissionMethod.READ)
  async findOne(
    @Param('id')
    id: string,
  ): Promise<BlockView> {
    const block = await this.blockRepository.findOne({
      where: { id },
      relations: this.relations,
    });

    return this.toView(block);
  }

  @Post()
  @CheckMethodAccess(AccessEntity.BLOCK, AccessMethod.POST)
  async create(
    @Body()
    data: BlockInput,
  ): Promise<BlockView> {
    const {
      strings,
      points,
      permissions,
      descriptions,
      counters,
      files,
      images,
      status,
      ...blockData
    } = data;

    const block = await this.dataSource.transaction(async (transaction) => {
      const blk = transaction.create(Block, blockData);
      const saved = await transaction.save(blk);

      await this.stringAttributeService.create<Block>(transaction, Block2String, saved.id, strings);
      await this.pointAttributeService.create<Block>(transaction, Block2Point, saved.id, points);
      await this.permissionService.create<Block>(transaction, Block4Permission, saved.id, permissions);
      await this.descriptionAttributeService.create<Block>(transaction, Block2Description, saved.id, descriptions);
      await this.counterAttributeService.create<Block>(transaction, Block2Counter, saved.id, counters);
      await this.fileAttributeService.create<Block>(transaction, Block2File, saved.id, files);
      await this.imageService.create<Block>(transaction, Block4Image, saved.id, images);
      await this.statusService.create<Block>(transaction, Block4Status, saved.id, status);

      return transaction.findOne(Block, {
        where: { id: saved.id },
        relations: this.relations,
      });
    });

    return this.toView(block);
  }

  @Put(':id')
  @CheckId(Block)
  @CheckMethodAccess(AccessEntity.BLOCK, AccessMethod.PUT)
  @CheckIdPermission(Block, PermissionMethod.WRITE)
  async update(
    @Param('id')
    id: string,
    @Body()
    data: BlockInput,
  ): Promise<BlockView> {
    const {
      strings,
      points,
      permissions,
      descriptions,
      counters,
      files,
      images,
      status,
      ...blockData
    } = data;

    const block = await this.dataSource.transaction(async (transaction) => {
      await transaction.update(Block, id, blockData);

      await this.stringAttributeService.update<Block>(transaction, Block2String, id, strings);
      await this.pointAttributeService.update<Block>(transaction, Block2Point, id, points);
      await this.permissionService.update<Block>(transaction, Block4Permission, id, permissions);
      await this.descriptionAttributeService.update<Block>(transaction, Block2Description, id, descriptions);
      await this.counterAttributeService.update<Block>(transaction, Block2Counter, id, counters);
      await this.fileAttributeService.update<Block>(transaction, Block2File, id, files);
      await this.imageService.update<Block>(transaction, Block4Image, id, images);
      await this.statusService.update<Block>(transaction, Block4Status, id, status);

      return transaction.findOne(Block, {
        where: { id },
        relations: this.relations,
      });
    });

    return this.toView(block);
  }

  @Delete(':id')
  @CheckId(Block)
  @CheckMethodAccess(AccessEntity.BLOCK, AccessMethod.DELETE)
  @CheckIdPermission(Block, PermissionMethod.DELETE)
  async remove(
    @Param('id')
    id: string,
  ): Promise<{ data: BlockView; deletedAt: string }> {
    const block = await this.blockRepository.findOne({
      where: { id },
      relations: this.relations,
    });

    await this.blockRepository.delete(id);

    return {
      data: this.toView(block),
      deletedAt: new Date().toISOString(),
    };
  }
}
