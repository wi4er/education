import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { CheckMethodAccess } from '../../common/access/check-method-access.guard';
import { AccessEntity } from '../../common/access/access-entity.enum';
import { AccessMethod } from '../../personal/entities/access/access-method.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, IsNull, Or, Repository } from 'typeorm';
import { Element } from '../entities/element/element.entity';
import { Element2String } from '../entities/element/element2string.entity';
import { Element2Point } from '../entities/element/element2point.entity';
import { Element2Description } from '../entities/element/element2description.entity';
import { Element2Counter } from '../entities/element/element2counter.entity';
import { ElementView } from '../views/element.view';
import { ElementInput } from '../inputs/element.input';
import { PointAttributeService } from '../../common/services/point-attribute.service';
import { StringAttributeService } from '../../common/services/string-attribute.service';
import { PermissionService } from '../../common/services/permission.service';
import { DescriptionAttributeService } from '../../common/services/description-attribute.service';
import { CounterAttributeService } from '../../common/services/counter-attribute.service';
import { SectionService } from '../services/section.service';
import { CheckId } from '../../common/check-id/check-id.guard';
import { CheckIdPermission } from '../../common/permission/check-id-permission.guard';
import { PermissionMethod } from '../../common/permission/permission.method';
import { Element4Permission } from '../entities/element/element4permission.entity';
import { CurrentGroups } from '../../personal/decorators/current-groups.decorator';

@Controller('element')
export class ElementController {

  constructor(
    @InjectRepository(Element)
    private readonly elementRepository: Repository<Element>,
    private readonly dataSource: DataSource,
    private readonly pointAttributeService: PointAttributeService,
    private readonly stringAttributeService: StringAttributeService,
    private readonly permissionService: PermissionService,
    private readonly descriptionAttributeService: DescriptionAttributeService,
    private readonly counterAttributeService: CounterAttributeService,
    private readonly sectionService: SectionService,
  ) {
  }

  toView(element: Element): ElementView {
    return {
      id: element.id,
      parentId: element.parentId,
      createdAt: element.createdAt,
      updatedAt: element.updatedAt,
      attributes: {
        strings: element.strings?.map(str => ({
          lang: str.languageId,
          attr: str.attributeId,
          value: str.value,
        })) ?? [],
        points: element.points?.map(pnt => ({
          attr: pnt.attributeId,
          point: pnt.pointId,
        })) ?? [],
        descriptions: element.descriptions?.map(desc => ({
          lang: desc.languageId,
          attr: desc.attributeId,
          value: desc.value,
        })) ?? [],
        counters: element.counters?.map(cnt => ({
          attr: cnt.attributeId,
          point: cnt.pointId,
          measure: cnt.measureId,
          count: cnt.count,
        })) ?? [],
      },
      permissions: element.permissions?.map(perm => ({
        group: perm.groupId,
        method: perm.method,
      })) ?? [],
      sections: element.sections?.map(e4s => e4s.sectionId) ?? [],
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
  ): Promise<ElementView[]> {
    const elements = await this.elementRepository.find({
      where: {
        permissions: {
          groupId: Or(In(groups), IsNull()),
          method: In([PermissionMethod.READ, PermissionMethod.ALL]),
        },
      },
      relations: ['strings', 'points', 'permissions', 'descriptions', 'counters', 'sections'],
      take: limit,
      skip: offset,
    });
    return elements.map(el => this.toView(el));
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
      relations: ['strings', 'points', 'permissions', 'descriptions', 'counters', 'sections'],
    });
    return this.toView(element);
  }

  @Post()
  @CheckMethodAccess(AccessEntity.ELEMENT, AccessMethod.POST)
  async create(
    @Body()
    data: ElementInput,
  ): Promise<ElementView> {
    const { strings, points, permissions, descriptions, counters, sections, ...elementData } = data;

    const element = await this.dataSource.transaction(async transaction => {
      const el = transaction.create(Element, elementData);
      const savedElement = await transaction.save(el);

      await this.stringAttributeService.create<Element>(transaction, Element2String, savedElement.id, strings);
      await this.pointAttributeService.create<Element>(transaction, Element2Point, savedElement.id, points);
      await this.permissionService.create<Element>(transaction, Element4Permission, permissions, savedElement.id);
      await this.descriptionAttributeService.create<Element>(transaction, Element2Description, savedElement.id, descriptions);
      await this.counterAttributeService.create<Element>(transaction, Element2Counter, savedElement.id, counters);
      await this.sectionService.create(transaction, savedElement.id, sections);

      return transaction.findOne(Element, {
        where: { id: savedElement.id },
        relations: ['strings', 'points', 'permissions', 'descriptions', 'counters', 'sections'],
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
    const { strings, points, permissions, descriptions, counters, sections, ...elementData } = data;

    const element = await this.dataSource.transaction(async transaction => {
      await transaction.update(Element, id, elementData);

      await this.stringAttributeService.update<Element>(transaction, Element2String, id, strings);
      await this.pointAttributeService.update<Element>(transaction, Element2Point, id, points);
      await this.permissionService.update<Element>(transaction, Element4Permission, id, permissions);
      await this.descriptionAttributeService.update<Element>(transaction, Element2Description, id, descriptions);
      await this.counterAttributeService.update<Element>(transaction, Element2Counter, id, counters);
      await this.sectionService.update(transaction, id, sections);

      return transaction.findOne(Element, {
        where: { id },
        relations: ['strings', 'points', 'permissions', 'descriptions', 'counters', 'sections'],
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
