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
import { AccessMethod } from '../entities/access/access-method.enum';
import { CheckId } from '../../common/check-id/check-id.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Group } from '../entities/group/group.entity';
import { Group2String } from '../entities/group/group2string.entity';
import { Group2Point } from '../entities/group/group2point.entity';
import { Group2Description } from '../entities/group/group2description.entity';
import { Group4Status } from '../entities/group/group4status.entity';
import { GroupView } from '../views/group.view';
import { GroupInput } from '../inputs/group.input';
import { PointAttributeService } from '../../common/services/point-attribute.service';
import { StringAttributeService } from '../../common/services/string-attribute.service';
import { DescriptionAttributeService } from '../../common/services/description-attribute.service';
import { StatusService } from '../../common/services/status.service';

@Controller('group')
export class GroupController {

  private readonly relations = ['strings', 'points', 'descriptions', 'statuses'];

  constructor(
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    private readonly dataSource: DataSource,
    private readonly pointAttributeService: PointAttributeService,
    private readonly stringAttributeService: StringAttributeService,
    private readonly descriptionAttributeService: DescriptionAttributeService,
    private readonly statusService: StatusService,
  ) {}

  toView(group: Group): GroupView {
    return {
      id: group.id,
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,
      attributes: {
        strings:
          group.strings?.map((str) => ({
            lang: str.languageId,
            attr: str.attributeId,
            value: str.value,
          })) ?? [],
        points:
          group.points?.map((pnt) => ({
            attr: pnt.attributeId,
            pnt: pnt.pointId,
          })) ?? [],
        descriptions:
          group.descriptions?.map((desc) => ({
            lang: desc.languageId,
            attr: desc.attributeId,
            value: desc.value,
          })) ?? [],
      },
      status: group.statuses?.map((s) => s.statusId) ?? [],
    };
  }

  @Get()
  @CheckMethodAccess(AccessEntity.GROUP, AccessMethod.GET)
  async findAll(
    @Query('limit')
    limit?: number,
    @Query('offset')
    offset?: number,
  ): Promise<{ data: GroupView[]; count: number }> {
    const [groups, count] = await this.groupRepository.findAndCount({
      relations: this.relations,
      take: limit,
      skip: offset,
    });
    return {
      data: groups.map((g) => this.toView(g)),
      count,
    };
  }

  @Get(':id')
  @CheckId(Group)
  @CheckMethodAccess(AccessEntity.GROUP, AccessMethod.GET)
  async findOne(
    @Param('id')
    id: string,
  ): Promise<GroupView> {
    const group = await this.groupRepository.findOne({
      where: { id },
      relations: this.relations,
    });
    return this.toView(group);
  }

  @Post()
  @CheckMethodAccess(AccessEntity.GROUP, AccessMethod.POST)
  async create(
    @Body()
    data: GroupInput,
  ): Promise<GroupView> {
    const { strings, points, descriptions, status, ...groupData } = data;

    const group = await this.dataSource.transaction(async (transaction) => {
      const created = transaction.create(Group, groupData);
      const saved = await transaction.save(created);

      await this.stringAttributeService.create<Group>(transaction, Group2String, saved.id, strings);
      await this.pointAttributeService.create<Group>(transaction, Group2Point, saved.id, points);
      await this.descriptionAttributeService.create<Group>(transaction, Group2Description, saved.id, descriptions);
      await this.statusService.create<Group>(transaction, Group4Status, saved.id, status);

      return transaction.findOne(Group, {
        where: { id: saved.id },
        relations: this.relations,
      });
    });

    return this.toView(group);
  }

  @Put(':id')
  @CheckId(Group)
  @CheckMethodAccess(AccessEntity.GROUP, AccessMethod.PUT)
  async update(
    @Param('id')
    id: string,
    @Body()
    data: GroupInput,
  ): Promise<GroupView> {
    const { strings, points, descriptions, status, ...groupData } = data;

    const group = await this.dataSource.transaction(async (transaction) => {
      await transaction.update(Group, id, groupData);

      await this.stringAttributeService.update<Group>(transaction, Group2String, id, strings);
      await this.pointAttributeService.update<Group>(transaction, Group2Point, id, points);
      await this.descriptionAttributeService.update<Group>(transaction, Group2Description, id, descriptions);
      await this.statusService.update<Group>(transaction, Group4Status, id, status);

      return transaction.findOne(Group, {
        where: { id },
        relations: this.relations,
      });
    });

    return this.toView(group);
  }

  @Delete(':id')
  @CheckId(Group)
  @CheckMethodAccess(AccessEntity.GROUP, AccessMethod.DELETE)
  async remove(
    @Param('id')
    id: string,
  ): Promise<{ data: GroupView; deletedAt: string }> {
    const group = await this.groupRepository.findOne({
      where: { id },
      relations: this.relations,
    });

    await this.groupRepository.delete(id);

    return {
      data: this.toView(group),
      deletedAt: new Date().toISOString(),
    };
  }

}
