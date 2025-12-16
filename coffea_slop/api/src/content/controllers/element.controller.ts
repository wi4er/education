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
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Element } from '../entities/element/element.entity';
import { Element2String } from '../entities/element/element2string.entity';
import { Element2Point } from '../entities/element/element2point.entity';
import { Element2Permission } from '../entities/element/element2permission.entity';
import { Element2Description } from '../entities/element/element2description.entity';
import { Element4Section } from '../entities/element/element4section.entity';
import { ElementView } from '../views/element.view';
import { ElementInput } from '../inputs/element.input';
import { PointAttributeService } from '../../common/services/point-attribute.service';
import { StringAttributeService } from '../../common/services/string-attribute.service';
import { PermissionAttributeService } from '../../common/services/permission-attribute.service';
import { DescriptionAttributeService } from '../../common/services/description-attribute.service';
import { CheckId } from '../../common/check-id/check-id.guard';

@Controller('element')
export class ElementController {

  constructor(
    @InjectRepository(Element)
    private readonly elementRepository: Repository<Element>,
    private readonly dataSource: DataSource,
    private readonly pointAttributeService: PointAttributeService,
    private readonly stringAttributeService: StringAttributeService,
    private readonly permissionAttributeService: PermissionAttributeService,
    private readonly descriptionAttributeService: DescriptionAttributeService,
  ) {
  }

  toView(element: Element): ElementView {
    return {
      id: element.id,
      blockId: element.blockId,
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
  async findAll(): Promise<ElementView[]> {
    const elements = await this.elementRepository.find({
      relations: ['strings', 'points', 'permissions', 'descriptions', 'sections'],
    });
    return elements.map(el => this.toView(el));
  }

  @Get(':id')
  @CheckId(Element)
  @CheckMethodAccess(AccessEntity.ELEMENT, AccessMethod.GET)
  async findOne(
    @Param('id')
    id: string,
  ): Promise<ElementView> {
    const element = await this.elementRepository.findOne({
      where: { id },
      relations: ['strings', 'points', 'permissions', 'descriptions', 'sections'],
    });
    return this.toView(element);
  }

  @Post()
  @CheckMethodAccess(AccessEntity.ELEMENT, AccessMethod.POST)
  async create(
    @Body()
    data: ElementInput,
  ): Promise<ElementView> {
    const { strings, points, permissions, descriptions, sections, ...elementData } = data;

    const element = await this.dataSource.transaction(async transaction => {
      const el = transaction.create(Element, elementData);
      const savedElement = await transaction.save(el);

      await this.stringAttributeService.create<Element>(transaction, Element2String, strings);
      await this.pointAttributeService.create<Element>(transaction, Element2Point, points);
      await this.permissionAttributeService.create<Element>(transaction, Element2Permission, permissions);
      await this.descriptionAttributeService.create<Element>(transaction, Element2Description, descriptions);

      if (sections?.length) {
        const element4sections = sections.map(sectionId =>
          transaction.create(Element4Section, { elementId: savedElement.id, sectionId }),
        );
        await transaction.save(element4sections);
      }

      return transaction.findOne(Element, {
        where: { id: savedElement.id },
        relations: ['strings', 'points', 'permissions', 'descriptions', 'sections'],
      });
    });

    return this.toView(element);
  }

  @Put(':id')
  @CheckId(Element)
  @CheckMethodAccess(AccessEntity.ELEMENT, AccessMethod.PUT)
  async update(
    @Param('id')
    id: string,
    @Body()
    data: ElementInput,
  ): Promise<ElementView> {
    const { strings, points, permissions, descriptions, sections, ...elementData } = data;

    const element = await this.dataSource.transaction(async transaction => {
      await transaction.update(Element, id, elementData);

      await this.stringAttributeService.update<Element>(transaction, Element2String, id, strings);
      await this.pointAttributeService.update<Element>(transaction, Element2Point, id, points);
      await this.permissionAttributeService.update<Element>(transaction, Element2Permission, id, permissions);
      await this.descriptionAttributeService.update<Element>(transaction, Element2Description, id, descriptions);

      if (sections?.length) {
        await transaction.delete(Element4Section, { elementId: id });

        if (sections.length) {
          const element4sections = sections.map(sectionId =>
            transaction.create(Element4Section, { elementId: id, sectionId }),
          );
          await transaction.save(element4sections);
        }
      }

      return transaction.findOne(Element, {
        where: { id },
        relations: ['strings', 'points', 'permissions', 'descriptions', 'sections'],
      });
    });

    return this.toView(element);
  }

  @Delete(':id')
  @CheckId(Element)
  @CheckMethodAccess(AccessEntity.ELEMENT, AccessMethod.DELETE)
  async remove(
    @Param('id')
    id: string
  ): Promise<void> {
    await this.elementRepository.delete(id);
  }

}
