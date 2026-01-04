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
import { CheckId } from '../../common/check-id/check-id.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In, Or, IsNull } from 'typeorm';
import { Point } from '../entities/point/point.entity';
import { Point2String } from '../entities/point/point2string.entity';
import { Point2Point } from '../entities/point/point2point.entity';
import { Point4Status } from '../entities/point/point4status.entity';
import { PointView } from '../views/point.view';
import { PointInput } from '../inputs/point.input';
import { PointAttributeService } from '../../common/services/point-attribute.service';
import { StringAttributeService } from '../../common/services/string-attribute.service';
import { StatusService } from '../../common/services/status.service';
import { CurrentGroups } from '../../personal/decorators/current-groups.decorator';
import { PermissionMethod } from '../../common/permission/permission.method';

@Controller('point')
export class PointController {

  private readonly relations = ['strings', 'points', 'statuses'];

  constructor(
    @InjectRepository(Point)
    private readonly pointRepository: Repository<Point>,
    private readonly dataSource: DataSource,
    private readonly pointAttributeService: PointAttributeService,
    private readonly stringAttributeService: StringAttributeService,
    private readonly statusService: StatusService,
  ) {}

  toView(point: Point): PointView {
    return {
      id: point.id,
      createdAt: point.createdAt,
      updatedAt: point.updatedAt,
      directoryId: point.directoryId,
      attributes: {
        strings:
          point.strings?.map((str) => ({
            lang: str.languageId,
            attr: str.attributeId,
            value: str.value,
          })) ?? [],
        points:
          point.points?.map((pnt) => ({
            attr: pnt.attributeId,
            pnt: pnt.pointId,
          })) ?? [],
      },
      status: point.statuses?.map((s) => s.statusId) ?? [],
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
  ): Promise<PointView[]> {
    const points = await this.pointRepository.find({
      where: {
        directory: {
          permissions: {
            method: In([PermissionMethod.READ, PermissionMethod.ALL]),
            groupId: Or(IsNull(), In(groups)),
          },
        },
      },
      relations: this.relations,
      take: limit,
      skip: offset,
    });
    return points.map((pnt) => this.toView(pnt));
  }

  @Get(':id')
  @CheckId(Point)
  async findOne(
    @Param('id')
    id: string,
  ): Promise<PointView> {
    const point = await this.pointRepository.findOne({
      where: { id },
      relations: this.relations,
    });
    return this.toView(point);
  }

  @Post()
  async create(
    @Body()
    data: PointInput,
  ): Promise<PointView> {
    const { strings, points, status, ...pointData } = data;

    const point = await this.dataSource.transaction(async (transaction) => {
      const pnt = transaction.create(Point, pointData);
      const savedPoint = await transaction.save(pnt);

      await this.stringAttributeService.create<Point>(transaction, Point2String, savedPoint.id, strings);
      await this.pointAttributeService.create<Point>(transaction, Point2Point, savedPoint.id, points);
      await this.statusService.create<Point>(transaction, Point4Status, savedPoint.id, status);

      return transaction.findOne(Point, {
        where: { id: savedPoint.id },
        relations: this.relations,
      });
    });

    return this.toView(point);
  }

  @Put(':id')
  @CheckId(Point)
  async update(
    @Param('id')
    id: string,
    @Body()
    data: PointInput,
  ): Promise<PointView> {
    const { strings, points, status, ...pointData } = data;

    const point = await this.dataSource.transaction(async (transaction) => {
      await transaction.update(Point, id, pointData);

      await this.stringAttributeService.update<Point>(transaction, Point2String, id, strings);
      await this.pointAttributeService.update<Point>(transaction, Point2Point, id, points);
      await this.statusService.update<Point>(transaction, Point4Status, id, status);

      return transaction.findOne(Point, {
        where: { id },
        relations: this.relations,
      });
    });

    return this.toView(point);
  }

  @Delete(':id')
  @CheckId(Point)
  async remove(
    @Param('id')
    id: string,
  ): Promise<void> {
    await this.pointRepository.delete(id);
  }
}
