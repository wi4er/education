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
import { PermissionMethod } from '../../common/permission/permission.method';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In, IsNull, Or } from 'typeorm';
import { CurrentGroups } from '../../personal/decorators/current-groups.decorator';
import { Block } from '../entities/block/block.entity';
import { Block2String } from '../entities/block/block2string.entity';
import { Block2Point } from '../entities/block/block2point.entity';
import { Block2Description } from '../entities/block/block2description.entity';
import { Block2Counter } from '../entities/block/block2counter.entity';
import { BlockView } from '../views/block.view';
import { BlockInput } from '../inputs/block.input';
import { PointAttributeService } from '../../common/services/point-attribute.service';
import { StringAttributeService } from '../../common/services/string-attribute.service';
import { PermissionAttributeService } from '../../common/services/permission-attribute.service';
import { DescriptionAttributeService } from '../../common/services/description-attribute.service';
import { CounterAttributeService } from '../../common/services/counter-attribute.service';
import { Block4Permission } from '../entities/block/block4permission.entity';

@Controller('block')
export class BlockController {

  constructor(
    @InjectRepository(Block)
    private readonly blockRepository: Repository<Block>,
    private readonly dataSource: DataSource,
    private readonly pointAttributeService: PointAttributeService,
    private readonly stringAttributeService: StringAttributeService,
    private readonly permissionAttributeService: PermissionAttributeService,
    private readonly descriptionAttributeService: DescriptionAttributeService,
    private readonly counterAttributeService: CounterAttributeService,
  ) {
  }

  toView(block: Block): BlockView {
    return {
      id: block.id,
      createdAt: block.createdAt,
      updatedAt: block.updatedAt,
      attributes: {
        strings: block.strings?.map(str => ({
          lang: str.languageId,
          attr: str.attributeId,
          value: str.value,
        })) ?? [],
        points: block.points?.map(pnt => ({
          attr: pnt.attributeId,
          point: pnt.pointId,
        })) ?? [],
        descriptions: block.descriptions?.map(desc => ({
          lang: desc.languageId,
          attr: desc.attributeId,
          value: desc.value,
        })) ?? [],
        counters: block.counters?.map(cnt => ({
          attr: cnt.attributeId,
          point: cnt.pointId,
          measure: cnt.measureId,
          count: cnt.count,
        })) ?? [],
      },
      permissions: block.permissions?.map(perm => ({
        group: perm.groupId,
        method: perm.method,
      })) ?? [],
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
  ): Promise<BlockView[]> {
    const blocks = await this.blockRepository.find({
      where: {
        permissions: {
          groupId: Or(In(groups), IsNull()),
          method: In([PermissionMethod.READ, PermissionMethod.ALL]),
        },
      },
      relations: ['strings', 'points', 'permissions', 'descriptions', 'counters'],
      take: limit,
      skip: offset,
    });
    return blocks.map(block => this.toView(block));
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
      relations: ['strings', 'points', 'permissions', 'descriptions', 'counters'],
    });
    return this.toView(block);
  }

  @Post()
  @CheckMethodAccess(AccessEntity.BLOCK, AccessMethod.POST)
  async create(
    @Body()
    data: BlockInput,
  ): Promise<BlockView> {
    const { strings, points, permissions, descriptions, counters, ...blockData } = data;

    const block = await this.dataSource.transaction(async transaction => {
      const blk = transaction.create(Block, blockData);
      const savedBlock = await transaction.save(blk);

      await this.stringAttributeService.create<Block>(transaction, Block2String, strings);
      await this.pointAttributeService.create<Block>(transaction, Block2Point, points);
      await this.permissionAttributeService.create<Block>(transaction, Block4Permission, permissions);
      await this.descriptionAttributeService.create<Block>(transaction, Block2Description, descriptions);
      await this.counterAttributeService.create<Block>(transaction, Block2Counter, counters);

      return transaction.findOne(Block, {
        where: { id: savedBlock.id },
        relations: ['strings', 'points', 'permissions', 'descriptions', 'counters'],
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
    const { strings, points, permissions, descriptions, counters, ...blockData } = data;

    const block = await this.dataSource.transaction(async transaction => {
      await transaction.update(Block, id, blockData);

      await this.stringAttributeService.update<Block>(transaction, Block2String, id, strings);
      await this.pointAttributeService.update<Block>(transaction, Block2Point, id, points);
      await this.permissionAttributeService.update<Block>(transaction, Block4Permission, id, permissions);
      await this.descriptionAttributeService.update<Block>(transaction, Block2Description, id, descriptions);
      await this.counterAttributeService.update<Block>(transaction, Block2Counter, id, counters);

      return transaction.findOne(Block, {
        where: { id },
        relations: ['strings', 'points', 'permissions', 'descriptions', 'counters'],
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
  ): Promise<void> {
    await this.blockRepository.delete(id);
  }

}
