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
import { Section } from '../entities/section/section.entity';
import { Section2String } from '../entities/section/section2string.entity';
import { Section2Point } from '../entities/section/section2point.entity';
import { Section2Permission } from '../entities/section/section2permission.entity';
import { Section2Description } from '../entities/section/section2description.entity';
import { SectionView } from '../views/section.view';
import { SectionInput } from '../inputs/section.input';
import { PointAttributeService } from '../../common/services/point-attribute.service';
import { StringAttributeService } from '../../common/services/string-attribute.service';
import { PermissionAttributeService } from '../../common/services/permission-attribute.service';
import { DescriptionAttributeService } from '../../common/services/description-attribute.service';

@Controller('section')
export class SectionController {

  constructor(
    @InjectRepository(Section)
    private readonly sectionRepository: Repository<Section>,
    private readonly dataSource: DataSource,
    private readonly pointAttributeService: PointAttributeService,
    private readonly stringAttributeService: StringAttributeService,
    private readonly permissionAttributeService: PermissionAttributeService,
    private readonly descriptionAttributeService: DescriptionAttributeService,
  ) {}

  toView(section: Section): SectionView {
    return {
      id: section.id,
      blockId: section.blockId,
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
          point: pnt.pointId,
        })) ?? [],
        descriptions: section.descriptions?.map(desc => ({
          lang: desc.languageId,
          attr: desc.attributeId,
          value: desc.value,
        })) ?? [],
      },
      permissions: section.permissions?.map(perm => ({
        group: perm.groupId,
        method: perm.method,
      })) ?? [],
    };
  }

  @Get()
  @CheckMethodAccess(AccessEntity.SECTION, AccessMethod.GET)
  async findAll(): Promise<SectionView[]> {
    const sections = await this.sectionRepository.find({
      relations: ['strings', 'points', 'permissions', 'descriptions'],
    });
    return sections.map(sec => this.toView(sec));
  }

  @Get(':id')
  @CheckId(Section)
  @CheckMethodAccess(AccessEntity.SECTION, AccessMethod.GET)
  async findOne(@Param('id') id: string): Promise<SectionView> {
    const section = await this.sectionRepository.findOne({
      where: { id },
      relations: ['strings', 'points', 'permissions', 'descriptions'],
    });
    return this.toView(section);
  }

  @Post()
  @CheckMethodAccess(AccessEntity.SECTION, AccessMethod.POST)
  async create(
    @Body()
    data: SectionInput
  ): Promise<SectionView> {
    const { strings, points, permissions, descriptions, ...sectionData } = data;

    const section = await this.dataSource.transaction(async transaction => {
      const sec = transaction.create(Section, sectionData);
      const savedSection = await transaction.save(sec);

      await this.stringAttributeService.create<Section>(transaction, Section2String, strings);
      await this.pointAttributeService.create<Section>(transaction, Section2Point, points);
      await this.permissionAttributeService.create<Section>(transaction, Section2Permission, permissions);
      await this.descriptionAttributeService.create<Section>(transaction, Section2Description, descriptions);

      return transaction.findOne(Section, {
        where: { id: savedSection.id },
        relations: ['strings', 'points', 'permissions', 'descriptions'],
      });
    });

    return this.toView(section);
  }

  @Put(':id')
  @CheckId(Section)
  @CheckMethodAccess(AccessEntity.SECTION, AccessMethod.PUT)
  async update(
    @Param('id')
    id: string,
    @Body()
    data: SectionInput,
  ): Promise<SectionView> {
    const { strings, points, permissions, descriptions, ...sectionData } = data;

    const section = await this.dataSource.transaction(async transaction => {
      await transaction.update(Section, id, sectionData);

      await this.stringAttributeService.update<Section>(transaction, Section2String, id, strings);
      await this.pointAttributeService.update<Section>(transaction, Section2Point, id, points);
      await this.permissionAttributeService.update<Section>(transaction, Section2Permission, id, permissions);
      await this.descriptionAttributeService.update<Section>(transaction, Section2Description, id, descriptions);

      return transaction.findOne(Section, {
        where: { id },
        relations: ['strings', 'points', 'permissions', 'descriptions'],
      });
    });

    return this.toView(section);
  }

  @Delete(':id')
  @CheckId(Section)
  @CheckMethodAccess(AccessEntity.SECTION, AccessMethod.DELETE)
  async remove(@Param('id') id: string): Promise<void> {
    await this.sectionRepository.delete(id);
  }

}
