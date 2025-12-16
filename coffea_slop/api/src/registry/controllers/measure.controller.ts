import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
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
import { MeasureView } from '../views/measure.view';
import { MeasureInput } from '../inputs/measure.input';
import { PointAttributeService } from '../../common/services/point-attribute.service';
import { StringAttributeService } from '../../common/services/string-attribute.service';

@Controller('measure')
export class MeasureController {

  constructor(
    @InjectRepository(Measure)
    private readonly measureRepository: Repository<Measure>,
    private readonly dataSource: DataSource,
    private readonly pointAttributeService: PointAttributeService,
    private readonly stringAttributeService: StringAttributeService,
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
          point: pnt.pointId,
        })) ?? [],
      },
    };
  }

  @Get()
  @CheckMethodAccess(AccessEntity.MEASURE, AccessMethod.GET)
  async findAll(): Promise<MeasureView[]> {
    const measures = await this.measureRepository.find({
      relations: ['strings', 'points'],
    });
    return measures.map(m => this.toView(m));
  }

  @Get(':id')
  @CheckId(Measure)
  @CheckMethodAccess(AccessEntity.MEASURE, AccessMethod.GET)
  async findOne(@Param('id') id: string): Promise<MeasureView> {
    const measure = await this.measureRepository.findOne({
      where: { id },
      relations: ['strings', 'points'],
    });
    return this.toView(measure);
  }

  @Post()
  @CheckMethodAccess(AccessEntity.MEASURE, AccessMethod.POST)
  async create(
    @Body() data: MeasureInput
  ): Promise<MeasureView> {
    const { strings, points, ...measureData } = data;

    const measure = await this.dataSource.transaction(async transaction => {
      const m = transaction.create(Measure, measureData);
      const savedMeasure = await transaction.save(m);

      await this.stringAttributeService.create<Measure>(transaction, Measure2String, strings);
      await this.pointAttributeService.create<Measure>(transaction, Measure2Point, points);

      return transaction.findOne(Measure, {
        where: { id: savedMeasure.id },
        relations: ['strings', 'points'],
      });
    });

    return this.toView(measure);
  }

  @Put(':id')
  @CheckId(Measure)
  @CheckMethodAccess(AccessEntity.MEASURE, AccessMethod.PUT)
  async update(
    @Param('id') id: string,
    @Body() data: MeasureInput,
  ): Promise<MeasureView> {
    const { strings, points, ...measureData } = data;

    const measure = await this.dataSource.transaction(async transaction => {
      await transaction.update(Measure, id, measureData);

      await this.stringAttributeService.update<Measure>(transaction, Measure2String, id, strings);
      await this.pointAttributeService.update<Measure>(transaction, Measure2Point, id, points);

      return transaction.findOne(Measure, {
        where: { id },
        relations: ['strings', 'points'],
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
