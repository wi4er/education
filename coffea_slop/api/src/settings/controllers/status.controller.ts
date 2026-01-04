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
import { Status } from '../entities/status/status.entity';
import { Status2String } from '../entities/status/status2string.entity';
import { Status2Point } from '../entities/status/status2point.entity';
import { Status4Status } from '../entities/status/status4status.entity';
import { StatusView } from '../views/status.view';
import { StatusInput } from '../inputs/status.input';
import { PointAttributeService } from '../../common/services/point-attribute.service';
import { StringAttributeService } from '../../common/services/string-attribute.service';
import { StatusService } from '../../common/services/status.service';

@Controller('status')
export class StatusController {

  private readonly relations = ['strings', 'points', 'statuses'];

  constructor(
    @InjectRepository(Status)
    private readonly statusRepository: Repository<Status>,
    private readonly dataSource: DataSource,
    private readonly pointAttributeService: PointAttributeService,
    private readonly stringAttributeService: StringAttributeService,
    private readonly statusService: StatusService,
  ) {}

  toView(status: Status): StatusView {
    return {
      id: status.id,
      icon: status.icon,
      color: status.color,
      createdAt: status.createdAt,
      updatedAt: status.updatedAt,
      attributes: {
        strings:
          status.strings?.map((str) => ({
            lang: str.languageId,
            attr: str.attributeId,
            value: str.value,
          })) ?? [],
        points:
          status.points?.map((pnt) => ({
            attr: pnt.attributeId,
            pnt: pnt.pointId,
          })) ?? [],
      },
      status: status.statuses?.map((s) => s.statusId) ?? [],
    };
  }

  @Get()
  @CheckMethodAccess(AccessEntity.STATUS, AccessMethod.GET)
  async findAll(
    @Query('limit')
    limit?: number,
    @Query('offset')
    offset?: number,
  ): Promise<StatusView[]> {
    const statuses = await this.statusRepository.find({
      relations: this.relations,
      take: limit,
      skip: offset,
    });

    return statuses.map((status) => this.toView(status));
  }

  @Get(':id')
  @CheckId(Status)
  @CheckMethodAccess(AccessEntity.STATUS, AccessMethod.GET)
  async findOne(
    @Param('id')
    id: string,
  ): Promise<StatusView> {
    const status = await this.statusRepository.findOne({
      where: { id },
      relations: this.relations,
    });

    return this.toView(status);
  }

  @Post()
  @CheckMethodAccess(AccessEntity.STATUS, AccessMethod.POST)
  async create(
    @Body()
    data: StatusInput,
  ): Promise<StatusView> {
    const { strings, points, status: statusIds, ...statusData } = data;

    const status = await this.dataSource.transaction(async (transaction) => {
      const sts = transaction.create(Status, statusData);
      const savedStatus = await transaction.save(sts);

      await this.stringAttributeService.create<Status>(transaction, Status2String, savedStatus.id, strings);
      await this.pointAttributeService.create<Status>(transaction, Status2Point, savedStatus.id, points);
      await this.statusService.create<Status>(transaction, Status4Status, savedStatus.id, statusIds);

      return transaction.findOne(Status, {
        where: { id: savedStatus.id },
        relations: this.relations,
      });
    });

    return this.toView(status);
  }

  @Put(':id')
  @CheckId(Status)
  @CheckMethodAccess(AccessEntity.STATUS, AccessMethod.PUT)
  async update(
    @Param('id')
    id: string,
    @Body()
    data: StatusInput,
  ): Promise<StatusView> {
    const { strings, points, status: statusIds, ...statusData } = data;

    const status = await this.dataSource.transaction(async (transaction) => {
      await transaction.update(Status, id, statusData);

      await this.stringAttributeService.update<Status>(transaction, Status2String, id, strings);
      await this.pointAttributeService.update<Status>(transaction, Status2Point, id, points);
      await this.statusService.update<Status>(transaction, Status4Status, id, statusIds);

      return transaction.findOne(Status, {
        where: { id },
        relations: this.relations,
      });
    });

    return this.toView(status);
  }

  @Delete(':id')
  @CheckId(Status)
  @CheckMethodAccess(AccessEntity.STATUS, AccessMethod.DELETE)
  async remove(
    @Param('id')
    id: string,
  ): Promise<void> {
    await this.statusRepository.delete(id);
  }
}
