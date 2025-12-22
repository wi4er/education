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
import { Section } from '../entities/section/section.entity';
import { Section2String } from '../entities/section/section2string.entity';
import { Section2Point } from '../entities/section/section2point.entity';
import { Section2Description } from '../entities/section/section2description.entity';
import { Section2Counter } from '../entities/section/section2counter.entity';
import { SectionView } from '../views/section.view';
import { SectionInput } from '../inputs/section.input';
import { PointAttributeService } from '../../common/services/point-attribute.service';
import { StringAttributeService } from '../../common/services/string-attribute.service';
import { PermissionService } from '../../common/services/permission.service';
import { DescriptionAttributeService } from '../../common/services/description-attribute.service';
import { CounterAttributeService } from '../../common/services/counter-attribute.service';
import { StatusService } from '../../common/services/status.service';
import { Section4Permission } from '../entities/section/section4permission.entity';
import { Section4Status } from '../entities/section/section4status.entity';

@Controller('section')
export class SectionController {

  constructor(
    @InjectRepository(Section)
    private readonly sectionRepository: Repository<Section>,
    private readonly dataSource: DataSource,
    private readonly pointAttributeService: PointAttributeService,
    private readonly stringAttributeService: StringAttributeService,
    private readonly permissionService: PermissionService,
    private readonly descriptionAttributeService: DescriptionAttributeService,
    private readonly counterAttributeService: CounterAttributeService,
    private readonly statusService: StatusService,
  ) {
  }

  toView(section: Section): SectionView {
    return {
      id: section.id,
      parentId: section.parentId,
      createdAt: section.createdAt,
      updatedAt: section.updatedAt,
      attributes: {
        strings: section.strings?.map(str => ({
          lang: str.languageId,
          attr: str.attributeId,
          value: str.value,
        })) ?? [],
        points: section.points?.map(pnt => ({
          attr: pnt.attributeId,
          pnt: pnt.pointId,
        })) ?? [],
        descriptions: section.descriptions?.map(desc => ({
          lang: desc.languageId,
          attr: desc.attributeId,
          value: desc.value,
        })) ?? [],
        counters: section.counters?.map(cnt => ({
          attr: cnt.attributeId,
          pnt: cnt.pointId,
          msr: cnt.measureId,
          count: cnt.count,
        })) ?? [],
      },
      permissions: section.permissions?.map(perm => ({
        group: perm.groupId,
        method: perm.method,
      })) ?? [],
      status: section.statuses?.map(s => s.statusId) ?? [],
    };
  }

  @Get()
  @CheckMethodAccess(AccessEntity.SECTION, AccessMethod.GET)
  async findAll(
    @CurrentGroups()
    groups: string[],
    @Query('limit')
    limit?: number,
    @Query('offset')
    offset?: number,
  ): Promise<SectionView[]> {
    const sections = await this.sectionRepository.find({
      where: {
        permissions: {
          groupId: Or(In(groups), IsNull()),
          method: In([PermissionMethod.READ, PermissionMethod.ALL]),
        },
      },
      relations: ['strings', 'points', 'permissions', 'descriptions', 'counters', 'statuses'],
      take: limit,
      skip: offset,
    });
    return sections.map(sec => this.toView(sec));
  }

  @Get(':id')
  @CheckId(Section)
  @CheckMethodAccess(AccessEntity.SECTION, AccessMethod.GET)
  @CheckIdPermission(Section, PermissionMethod.READ)
  async findOne(
    @Param('id')
    id: string,
  ): Promise<SectionView> {
    const section = await this.sectionRepository.findOne({
      where: { id },
      relations: ['strings', 'points', 'permissions', 'descriptions', 'counters', 'statuses'],
    });
    return this.toView(section);
  }

  @Post()
  @CheckMethodAccess(AccessEntity.SECTION, AccessMethod.POST)
  async create(
    @Body()
    data: SectionInput,
  ): Promise<SectionView> {
    const { strings, points, permissions, descriptions, counters, status, ...sectionData } = data;

    const section = await this.dataSource.transaction(async transaction => {
      const sec = transaction.create(Section, sectionData);
      const savedSection = await transaction.save(sec);

      await this.stringAttributeService.create<Section>(transaction, Section2String, savedSection.id, strings);
      await this.pointAttributeService.create<Section>(transaction, Section2Point, savedSection.id, points);
      await this.permissionService.create<Section>(transaction, Section4Permission, permissions, savedSection.id);
      await this.descriptionAttributeService.create<Section>(transaction, Section2Description, savedSection.id, descriptions);
      await this.counterAttributeService.create<Section>(transaction, Section2Counter, savedSection.id, counters);
      await this.statusService.create<Section>(transaction, Section4Status, savedSection.id, status);

      return transaction.findOne(Section, {
        where: { id: savedSection.id },
        relations: ['strings', 'points', 'permissions', 'descriptions', 'counters', 'statuses'],
      });
    });

    return this.toView(section);
  }

  @Put(':id')
  @CheckId(Section)
  @CheckMethodAccess(AccessEntity.SECTION, AccessMethod.PUT)
  @CheckIdPermission(Section, PermissionMethod.WRITE)
  async update(
    @Param('id')
    id: string,
    @Body()
    data: SectionInput,
  ): Promise<SectionView> {
    const { strings, points, permissions, descriptions, counters, status, ...sectionData } = data;

    const section = await this.dataSource.transaction(async transaction => {
      await transaction.update(Section, id, sectionData);

      await this.stringAttributeService.update<Section>(transaction, Section2String, id, strings);
      await this.pointAttributeService.update<Section>(transaction, Section2Point, id, points);
      await this.permissionService.update<Section>(transaction, Section4Permission, id, permissions);
      await this.descriptionAttributeService.update<Section>(transaction, Section2Description, id, descriptions);
      await this.counterAttributeService.update<Section>(transaction, Section2Counter, id, counters);
      await this.statusService.update<Section>(transaction, Section4Status, id, status);

      return transaction.findOne(Section, {
        where: { id },
        relations: ['strings', 'points', 'permissions', 'descriptions', 'counters', 'statuses'],
      });
    });

    return this.toView(section);
  }

  @Delete(':id')
  @CheckId(Section)
  @CheckMethodAccess(AccessEntity.SECTION, AccessMethod.DELETE)
  @CheckIdPermission(Section, PermissionMethod.DELETE)
  async remove(
    @Param('id')
    id: string,
  ): Promise<void> {
    await this.sectionRepository.delete(id);
  }

}
