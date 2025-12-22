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
import { Attribute } from '../entities/attribute/attribute.entity';
import { Attribute2String } from '../entities/attribute/attribute2string.entity';
import { Attribute2Point } from '../entities/attribute/attribute2point.entity';
import { AttributeView } from '../views/attribute.view';
import { AttributeInput } from '../inputs/attribute.input';
import { PointAttributeService } from '../../common/services/point-attribute.service';
import { StringAttributeService } from '../../common/services/string-attribute.service';
import { StatusService } from '../../common/services/status.service';
import { AsPointService } from '../services/as-point.service';
import { Attribute4Status } from '../entities/attribute/attribute4status.entity';

@Controller('attribute')
export class AttributeController {

  constructor(
    @InjectRepository(Attribute)
    private readonly attributeRepository: Repository<Attribute>,
    private readonly dataSource: DataSource,
    private readonly pointAttributeService: PointAttributeService,
    private readonly stringAttributeService: StringAttributeService,
    private readonly asPointService: AsPointService,
    private readonly statusService: StatusService,
  ) {
  }

  toView(attribute: Attribute): AttributeView {
    return {
      id: attribute.id,
      type: attribute.type,
      asPoint: attribute.asPoint?.directoryId,
      status: attribute.statuses?.map(s => s.statusId) ?? [],
      createdAt: attribute.createdAt,
      updatedAt: attribute.updatedAt,
      attributes: {
        strings: attribute.strings?.map(str => ({
          lang: str.languageId,
          attr: str.attributeId,
          value: str.value,
        })) ?? [],
        points: attribute.points?.map(pnt => ({
          attr: pnt.attributeId,
          pnt: pnt.pointId,
        })) ?? [],
      },
    };
  }

  @Get()
  @CheckMethodAccess(AccessEntity.ATTRIBUTE, AccessMethod.GET)
  async findAll(
    @Query('limit')
    limit?: number,
    @Query('offset')
    offset?: number,
  ): Promise<AttributeView[]> {
    const attributes = await this.attributeRepository.find({
      relations: ['strings', 'points', 'asPoint', 'statuses'],
      take: limit,
      skip: offset,
    });

    return attributes.map(attr => this.toView(attr));
  }

  @Get(':id')
  @CheckId(Attribute)
  @CheckMethodAccess(AccessEntity.ATTRIBUTE, AccessMethod.GET)
  async findOne(
    @Param('id')
    id: string,
  ): Promise<AttributeView> {
    const attribute = await this.attributeRepository.findOne({
      where: { id },
      relations: ['strings', 'points', 'asPoint', 'statuses'],
    });

    return this.toView(attribute);
  }

  @Post()
  @CheckMethodAccess(AccessEntity.ATTRIBUTE, AccessMethod.POST)
  async create(
    @Body()
    data: AttributeInput
  ): Promise<AttributeView> {
    const { strings, points, asPoint, status, ...attributeData } = data;

    const attribute = await this.dataSource.transaction(async transaction => {
      const attr = transaction.create(Attribute, attributeData);
      const savedAttribute = await transaction.save(attr);

      await this.stringAttributeService.create<Attribute>(transaction, Attribute2String, savedAttribute.id, strings);
      await this.pointAttributeService.create<Attribute>(transaction, Attribute2Point, savedAttribute.id, points);
      await this.asPointService.create(transaction, savedAttribute.id, asPoint);
      await this.statusService.create<Attribute>(transaction, Attribute4Status, savedAttribute.id, status);

      return transaction.findOne(Attribute, {
        where: { id: savedAttribute.id },
        relations: ['strings', 'points', 'asPoint', 'statuses'],
      });
    });

    return this.toView(attribute);
  }

  @Put(':id')
  @CheckId(Attribute)
  @CheckMethodAccess(AccessEntity.ATTRIBUTE, AccessMethod.PUT)
  async update(
    @Param('id')
    id: string,
    @Body()
    data: AttributeInput,
  ): Promise<AttributeView> {
    const { strings, points, asPoint, status, ...attributeData } = data;

    const attribute = await this.dataSource.transaction(async transaction => {
      await transaction.update(Attribute, id, attributeData);

      await this.stringAttributeService.update<Attribute>(transaction, Attribute2String, id, strings);
      await this.pointAttributeService.update<Attribute>(transaction, Attribute2Point, id, points);
      await this.asPointService.update(transaction, id, asPoint);
      await this.statusService.update<Attribute>(transaction, Attribute4Status, id, status);

      return transaction.findOne(Attribute, {
        where: { id },
        relations: ['strings', 'points', 'asPoint', 'statuses'],
      });
    });

    return this.toView(attribute);
  }

  @Delete(':id')
  @CheckId(Attribute)
  @CheckMethodAccess(AccessEntity.ATTRIBUTE, AccessMethod.DELETE)
  async remove(
    @Param('id')
    id: string,
  ): Promise<void> {
    await this.attributeRepository.delete(id);
  }

}
