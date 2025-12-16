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
import { AccessMethod } from '../entities/access/access-method.enum';
import { CheckId } from '../../common/check-id/check-id.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Group } from '../entities/group/group.entity';
import { Group2String } from '../entities/group/group2string.entity';
import { Group2Point } from '../entities/group/group2point.entity';
import { Group2Description } from '../entities/group/group2description.entity';
import { GroupView } from '../views/group.view';
import { GroupInput } from '../inputs/group.input';
import { PointAttributeService } from '../../common/services/point-attribute.service';
import { StringAttributeService } from '../../common/services/string-attribute.service';
import { DescriptionAttributeService } from '../../common/services/description-attribute.service';

@Controller('group')
export class GroupController {

  constructor(
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    private readonly dataSource: DataSource,
    private readonly pointAttributeService: PointAttributeService,
    private readonly stringAttributeService: StringAttributeService,
    private readonly descriptionAttributeService: DescriptionAttributeService,
  ) {}

  toView(group: Group): GroupView {
    return {
      id: group.id,
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,
      attributes: {
        strings: group.strings?.map(str => ({
          lang: str.languageId,
          attr: str.attributeId,
          value: str.value,
        })) ?? [],
        points: group.points?.map(pnt => ({
          attr: pnt.attributeId,
          point: pnt.pointId,
        })) ?? [],
        descriptions: group.descriptions?.map(desc => ({
          lang: desc.languageId,
          attr: desc.attributeId,
          value: desc.value,
        })) ?? [],
      },
    };
  }

  @Get()
  @CheckMethodAccess(AccessEntity.GROUP, AccessMethod.GET)
  async findAll(): Promise<GroupView[]> {
    const groups = await this.groupRepository.find({
      relations: ['strings', 'points', 'descriptions'],
    });
    return groups.map(g => this.toView(g));
  }

  @Get(':id')
  @CheckId(Group)
  @CheckMethodAccess(AccessEntity.GROUP, AccessMethod.GET)
  async findOne(@Param('id') id: string): Promise<GroupView> {
    const group = await this.groupRepository.findOne({
      where: { id },
      relations: ['strings', 'points', 'descriptions'],
    });
    return this.toView(group);
  }

  @Post()
  @CheckMethodAccess(AccessEntity.GROUP, AccessMethod.POST)
  async create(
    @Body() data: GroupInput
  ): Promise<GroupView> {
    const { strings, points, descriptions, ...groupData } = data;

    const group = await this.dataSource.transaction(async transaction => {
      const g = transaction.create(Group, groupData);
      const savedGroup = await transaction.save(g);

      await this.stringAttributeService.create<Group>(transaction, Group2String, strings);
      await this.pointAttributeService.create<Group>(transaction, Group2Point, points);
      await this.descriptionAttributeService.create<Group>(transaction, Group2Description, descriptions);

      return transaction.findOne(Group, {
        where: { id: savedGroup.id },
        relations: ['strings', 'points', 'descriptions'],
      });
    });

    return this.toView(group);
  }

  @Put(':id')
  @CheckId(Group)
  @CheckMethodAccess(AccessEntity.GROUP, AccessMethod.PUT)
  async update(
    @Param('id') id: string,
    @Body() data: GroupInput,
  ): Promise<GroupView> {
    const { strings, points, descriptions, ...groupData } = data;

    const group = await this.dataSource.transaction(async transaction => {
      await transaction.update(Group, id, groupData);

      await this.stringAttributeService.update<Group>(transaction, Group2String, id, strings);
      await this.pointAttributeService.update<Group>(transaction, Group2Point, id, points);
      await this.descriptionAttributeService.update<Group>(transaction, Group2Description, id, descriptions);

      return transaction.findOne(Group, {
        where: { id },
        relations: ['strings', 'points', 'descriptions'],
      });
    });

    return this.toView(group);
  }

  @Delete(':id')
  @CheckId(Group)
  @CheckMethodAccess(AccessEntity.GROUP, AccessMethod.DELETE)
  async remove(@Param('id') id: string): Promise<void> {
    await this.groupRepository.delete(id);
  }

}
