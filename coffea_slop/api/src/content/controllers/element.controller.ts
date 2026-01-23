import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {CheckMethodAccess} from '../../common/access/check-method-access.guard';
import {AccessEntity} from '../../common/access/access-entity.enum';
import {AccessMethod} from '../../personal/entities/access/access-method.enum';
import {InjectRepository} from '@nestjs/typeorm';
import {DataSource, Repository} from 'typeorm';
import {Element} from '../entities/element/element.entity';
import {Element2String} from '../entities/element/element2string.entity';
import {Element2Point} from '../entities/element/element2point.entity';
import {Element2Description} from '../entities/element/element2description.entity';
import {Element2Counter} from '../entities/element/element2counter.entity';
import {Element2File} from '../entities/element/element2file.entity';
import {Element4Image} from '../entities/element/element4image.entity';
import {ElementView} from '../views/element.view';
import {ElementInput} from '../inputs/element.input';
import {PointAttributeService} from '../../common/services/point-attribute.service';
import {StringAttributeService} from '../../common/services/string-attribute.service';
import {PermissionService} from '../../common/services/permission.service';
import {DescriptionAttributeService} from '../../common/services/description-attribute.service';
import {CounterAttributeService} from '../../common/services/counter-attribute.service';
import {FileAttributeService} from '../../common/services/file-attribute.service';
import {SectionService} from '../services/section.service';
import {ImageService} from '../../common/services/image.service';
import {
  ElementFilterService,
  StringFilter,
  PointFilter,
  CounterFilter,
} from '../services/element-filter.service';
import {ElementSortService} from '../services/element-sort.service';
import {CheckId} from '../../common/check-id/check-id.guard';
import {CheckIdPermission} from '../../common/permission/check-id-permission.guard';
import {PermissionMethod} from '../../common/permission/permission.method';
import {Element4Permission} from '../entities/element/element4permission.entity';
import {Element4Status} from '../entities/element/element4status.entity';
import {CurrentGroups} from '../../personal/decorators/current-groups.decorator';
import {StatusService} from '../../common/services/status.service';

@Controller('element')
export class ElementController {

  private readonly relations = [
    'strings',
    'points',
    'permissions',
    'descriptions',
    'counters',
    'files',
    'images',
    'sections',
    'statuses',
  ];

  constructor(
    @InjectRepository(Element)
    private readonly elementRepository: Repository<Element>,
    private readonly dataSource: DataSource,
    private readonly pointAttributeService: PointAttributeService,
    private readonly stringAttributeService: StringAttributeService,
    private readonly permissionService: PermissionService,
    private readonly descriptionAttributeService: DescriptionAttributeService,
    private readonly counterAttributeService: CounterAttributeService,
    private readonly fileAttributeService: FileAttributeService,
    private readonly sectionService: SectionService,
    private readonly imageService: ImageService,
    private readonly statusService: StatusService,
    private readonly elementFilterService: ElementFilterService,
    private readonly elementSortService: ElementSortService,
  ) {
  }

  toView(element: Element): ElementView {
    return {
      id: element.id,
      parentId: element.parentId,
      createdAt: element.createdAt,
      updatedAt: element.updatedAt,
      attributes: {
        strings:
          element.strings?.map((str) => ({
            lang: str.languageId,
            attr: str.attributeId,
            value: str.value,
          })) ?? [],
        points:
          element.points?.map((pnt) => ({
            attr: pnt.attributeId,
            pnt: pnt.pointId,
          })) ?? [],
        descriptions:
          element.descriptions?.map((desc) => ({
            lang: desc.languageId,
            attr: desc.attributeId,
            value: desc.value,
          })) ?? [],
        counters:
          element.counters?.map((cnt) => ({
            attr: cnt.attributeId,
            pnt: cnt.pointId,
            msr: cnt.measureId,
            count: cnt.count,
          })) ?? [],
        files:
          element.files?.map((f) => ({
            attr: f.attributeId,
            file: f.fileId,
          })) ?? [],
      },
      permissions:
        element.permissions?.map((perm) => ({
          group: perm.groupId,
          method: perm.method,
        })) ?? [],
      images: element.images?.map((img) => img.fileId) ?? [],
      sections: element.sections?.map((e4s) => e4s.sectionId) ?? [],
      status: element.statuses?.map((s) => s.statusId) ?? [],
    };
  }

  @Get()
  @CheckMethodAccess(AccessEntity.ELEMENT, AccessMethod.GET)
  async findAll(
    @CurrentGroups()
    groups: Array<string>,
    @Query('limit')
    limit?: number,
    @Query('offset')
    offset?: number,
    @Query('order')
    order?: string,
    @Query('orderDir')
    orderDir?: 'ASC' | 'DESC',
    @Query('string')
    stringFilters?: StringFilter[],
    @Query('point')
    pointFilters?: PointFilter[],
    @Query('counter')
    counterFilters?: CounterFilter[],
  ): Promise<ElementView[]> {
    const qb = this.elementRepository
      .createQueryBuilder('element')
      .leftJoinAndSelect('element.strings', 'strings')
      .leftJoinAndSelect('element.points', 'points')
      .leftJoinAndSelect('element.permissions', 'permissions')
      .leftJoinAndSelect('element.descriptions', 'descriptions')
      .leftJoinAndSelect('element.counters', 'counters')
      .leftJoinAndSelect('element.files', 'files')
      .leftJoinAndSelect('element.images', 'images')
      .leftJoinAndSelect('element.sections', 'sections')
      .leftJoinAndSelect('element.statuses', 'statuses')
      .where(
        'permissions.groupId IN (:...groups) OR permissions.groupId IS NULL',
        { groups },
      )
      .andWhere('permissions.method IN (:...methods)', {
        methods: [PermissionMethod.READ, PermissionMethod.ALL],
      });

    this.elementFilterService.applyStringFilters(qb, stringFilters);
    this.elementFilterService.applyPointFilters(qb, pointFilters);
    this.elementFilterService.applyCounterFilters(qb, counterFilters);

    if (order) {
      const direction = orderDir === 'DESC' ? 'DESC' : 'ASC';
      this.elementSortService.apply(qb, order, direction);
    }

    if (limit) qb.take(limit);
    if (offset) qb.skip(offset);

    const elements = await qb.getMany();
    return elements.map((el) => this.toView(el));
  }

  @Get(':id')
  @CheckId(Element)
  @CheckMethodAccess(AccessEntity.ELEMENT, AccessMethod.GET)
  @CheckIdPermission(Element, PermissionMethod.READ)
  async findOne(
    @Param('id')
    id: string,
  ): Promise<ElementView> {
    const element = await this.elementRepository.findOne({
      where: { id },
      relations: this.relations,
    });

    return this.toView(element);
  }

  @Post()
  @CheckMethodAccess(AccessEntity.ELEMENT, AccessMethod.POST)
  async create(
    @Body()
    data: ElementInput,
  ): Promise<ElementView> {
    const {
      strings,
      points,
      permissions,
      descriptions,
      counters,
      files,
      images,
      sections,
      status,
      ...elementData
    } = data;

    const element = await this.dataSource.transaction(async (transaction) => {
      const el = transaction.create(Element, elementData);
      const { id } = await transaction.save(el);

      await this.stringAttributeService.create<Element>(transaction, Element2String, id, strings);
      await this.pointAttributeService.create<Element>(transaction, Element2Point, id, points);
      await this.permissionService.create<Element>(transaction, Element4Permission, id, permissions);
      await this.descriptionAttributeService.create<Element>(transaction, Element2Description, id, descriptions);
      await this.counterAttributeService.create<Element>(transaction, Element2Counter, id, counters);
      await this.fileAttributeService.create<Element>(transaction, Element2File, id, files);
      await this.imageService.create<Element>(transaction, Element4Image, id, images);
      await this.sectionService.create(transaction, id, sections);
      await this.statusService.create<Element>(transaction, Element4Status, id, status);

      return transaction.findOne(Element, {
        where: { id },
        relations: this.relations,
      });
    });

    return this.toView(element);
  }

  @Put(':id')
  @CheckId(Element)
  @CheckMethodAccess(AccessEntity.ELEMENT, AccessMethod.PUT)
  @CheckIdPermission(Element, PermissionMethod.WRITE)
  async update(
    @Param('id')
    id: string,
    @Body()
    data: ElementInput,
  ): Promise<ElementView> {
    const {
      strings,
      points,
      permissions,
      descriptions,
      counters,
      files,
      images,
      sections,
      status,
      ...elementData
    } = data;

    const element = await this.dataSource.transaction(async (transaction) => {
      await transaction.update(Element, id, elementData);

      await this.stringAttributeService.update<Element>(transaction, Element2String, id, strings);
      await this.pointAttributeService.update<Element>(transaction, Element2Point, id, points);
      await this.permissionService.update<Element>(transaction, Element4Permission, id, permissions);
      await this.descriptionAttributeService.update<Element>(transaction, Element2Description, id, descriptions);
      await this.counterAttributeService.update<Element>(transaction, Element2Counter, id, counters);
      await this.fileAttributeService.update<Element>(transaction, Element2File, id, files);
      await this.imageService.update<Element>(transaction, Element4Image, id, images);
      await this.sectionService.update(transaction, id, sections);
      await this.statusService.update<Element>(transaction, Element4Status, id, status);

      return transaction.findOne(Element, {
        where: { id },
        relations: this.relations,
      });
    });

    return this.toView(element);
  }

  @Delete(':id')
  @CheckId(Element)
  @CheckMethodAccess(AccessEntity.ELEMENT, AccessMethod.DELETE)
  @CheckIdPermission(Element, PermissionMethod.DELETE)
  async remove(
    @Param('id')
    id: string,
  ): Promise<void> {
    await this.elementRepository.delete(id);
  }

}
