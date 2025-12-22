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
import { Measure } from '../entities/measure/measure.entity';
import { Measure2String } from '../entities/measure/measure2string.entity';
import { Measure2Point } from '../entities/measure/measure2point.entity';
import { Measure4Status } from '../entities/measure/measure4status.entity';
import { MeasureView } from '../views/measure.view';
import { MeasureInput } from '../inputs/measure.input';
import { PointAttributeService } from '../../common/services/point-attribute.service';
import { StringAttributeService } from '../../common/services/string-attribute.service';
import { StatusService } from '../../common/services/status.service';

@Controller('measure')
export class MeasureController {

  constructor(
    @InjectRepository(Measure)
    private readonly measureRepository: Repository<Measure>,
    private readonly dataSource: DataSource,
    private readonly pointAttributeService: PointAttributeService,
    private readonly stringAttributeService: StringAttributeService,
    private readonly statusService: StatusService,
  ) {}

  toView(measure: Measure): MeasureView {
    return {
      id: measure.id,
      createdAt: measure.createdAt,
      updatedAt: measure.updatedAt,
      attributes: {
        strings: measure.strings?.map(str => ({
          lang: str.languageId,
          attr: str.attributeId,
          value: str.value,
        })) ?? [],
        points: measure.points?.map(pnt => ({
          attr: pnt.attributeId,
          pnt: pnt.pointId,
        })) ?? [],
      },
      status: measure.statuses?.map(s => s.statusId) ?? [],
    };
  }

  @Get()
  @CheckMethodAccess(AccessEntity.MEASURE, AccessMethod.GET)
  async findAll(
    @Query('limit')
    limit?: number,
    @Query('offset')
    offset?: number,
  ): Promise<MeasureView[]> {
    const measures = await this.measureRepository.find({
      relations: ['strings', 'points', 'statuses'],
      take: limit,
      skip: offset,
    });
    return measures.map(m => this.toView(m));
  }

  @Get(':id')
  @CheckId(Measure)
  @CheckMethodAccess(AccessEntity.MEASURE, AccessMethod.GET)
  async findOne(@Param('id') id: string): Promise<MeasureView> {
    const measure = await this.measureRepository.findOne({
      where: { id },
      relations: ['strings', 'points', 'statuses'],
    });

    return this.toView(measure);
  }

  @Post()
  @CheckMethodAccess(AccessEntity.MEASURE, AccessMethod.POST)
  async create(
    @Body() data: MeasureInput
  ): Promise<MeasureView> {
    const { strings, points, status, ...measureData } = data;

    const measure = await this.dataSource.transaction(async transaction => {
      const m = transaction.create(Measure, measureData);
      const savedMeasure = await transaction.save(m);

      await this.stringAttributeService.create<Measure>(transaction, Measure2String, savedMeasure.id, strings);
      await this.pointAttributeService.create<Measure>(transaction, Measure2Point, savedMeasure.id, points);
      await this.statusService.create<Measure>(transaction, Measure4Status, savedMeasure.id, status);

      return transaction.findOne(Measure, {
        where: { id: savedMeasure.id },
        relations: ['strings', 'points', 'statuses'],
      });
    });

    return this.toView(measure);
  }

  @Put(':id')
  @CheckId(Measure)
  @CheckMethodAccess(AccessEntity.MEASURE, AccessMethod.PUT)
  async update(
    @Param('id')
    id: string,
    @Body()
    data: MeasureInput,
  ): Promise<MeasureView> {
    const { strings, points, status, ...measureData } = data;

    const measure = await this.dataSource.transaction(async transaction => {
      await transaction.update(Measure, id, measureData);

      await this.stringAttributeService.update<Measure>(transaction, Measure2String, id, strings);
      await this.pointAttributeService.update<Measure>(transaction, Measure2Point, id, points);
      await this.statusService.update<Measure>(transaction, Measure4Status, id, status);

      return transaction.findOne(Measure, {
        where: { id },
        relations: ['strings', 'points', 'statuses'],
      });
    });

    return this.toView(measure);
  }

  @Delete(':id')
  @CheckId(Measure)
  @CheckMethodAccess(AccessEntity.MEASURE, AccessMethod.DELETE)
  async remove(@Param('id') id: string): Promise<void> {
    await this.measureRepository.delete(id);
  }

}
