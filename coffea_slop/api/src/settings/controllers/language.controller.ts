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
import {CheckMethodAccess} from '../../common/access/check-method-access.guard';
import {AccessEntity} from '../../common/access/access-entity.enum';
import {AccessMethod} from '../../personal/entities/access/access-method.enum';
import {CheckId} from '../../common/check-id/check-id.guard';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository, DataSource} from 'typeorm';
import {Language} from '../entities/language/language.entity';
import {Language2String} from '../entities/language/language2string.entity';
import {Language2Point} from '../entities/language/language2point.entity';
import {Language4Status} from '../entities/language/language4status.entity';
import {LanguageView} from '../views/language.view';
import {LanguageInput} from '../inputs/language.input';
import {PointAttributeService} from '../../common/services/point-attribute.service';
import {StringAttributeService} from '../../common/services/string-attribute.service';
import {StatusService} from '../../common/services/status.service';

@Controller('language')
export class LanguageController {

  private readonly relations = ['strings', 'points', 'statuses'];

  constructor(
    @InjectRepository(Language)
    private readonly languageRepository: Repository<Language>,
    private readonly dataSource: DataSource,
    private readonly pointAttributeService: PointAttributeService,
    private readonly stringAttributeService: StringAttributeService,
    private readonly statusService: StatusService,
  ) {
  }

  toView(language: Language): LanguageView {
    return {
      id: language.id,
      createdAt: language.createdAt,
      updatedAt: language.updatedAt,
      attributes: {
        strings:
          language.strings?.map((str) => ({
            lang: str.languageId,
            attr: str.attributeId,
            value: str.value,
          })) ?? [],
        points:
          language.points?.map((pnt) => ({
            attr: pnt.attributeId,
            pnt: pnt.pointId,
          })) ?? [],
      },
      status: language.statuses?.map((s) => s.statusId) ?? [],
    };
  }

  @Get()
  @CheckMethodAccess(AccessEntity.LANGUAGE, AccessMethod.GET)
  async findAll(
    @Query('limit')
    limit?: number,
    @Query('offset')
    offset?: number,
  ): Promise<LanguageView[]> {
    const languages = await this.languageRepository.find({
      relations: this.relations,
      take: limit,
      skip: offset,
    });
    return languages.map((lng) => this.toView(lng));
  }

  @Get(':id')
  @CheckId(Language)
  @CheckMethodAccess(AccessEntity.LANGUAGE, AccessMethod.GET)
  async findOne(
    @Param('id')
    id: string,
  ): Promise<LanguageView> {
    const language = await this.languageRepository.findOne({
      where: { id },
      relations: this.relations,
    });
    return this.toView(language);
  }

  @Post()
  @CheckMethodAccess(AccessEntity.LANGUAGE, AccessMethod.POST)
  async create(
    @Body()
    data: LanguageInput,
  ): Promise<LanguageView> {
    const { strings, points, status, ...languageData } = data;

    const language = await this.dataSource.transaction(async (transaction) => {
      const lng = transaction.create(Language, languageData);
      const savedLanguage = await transaction.save(lng);

      await this.stringAttributeService.create<Language>(transaction, Language2String, savedLanguage.id, strings);
      await this.pointAttributeService.create<Language>(transaction, Language2Point, savedLanguage.id, points);
      await this.statusService.create<Language>(transaction, Language4Status, savedLanguage.id, status);

      return transaction.findOne(Language, {
        where: { id: savedLanguage.id },
        relations: this.relations,
      });
    });

    return this.toView(language);
  }

  @Put(':id')
  @CheckId(Language)
  @CheckMethodAccess(AccessEntity.LANGUAGE, AccessMethod.PUT)
  async update(
    @Param('id')
    id: string,
    @Body()
    data: LanguageInput,
  ): Promise<LanguageView> {
    const { strings, points, status, ...languageData } = data;

    const language = await this.dataSource.transaction(async (transaction) => {
      await transaction.update(Language, id, languageData);

      await this.stringAttributeService.update<Language>(transaction, Language2String, id, strings);
      await this.pointAttributeService.update<Language>(transaction, Language2Point, id, points);
      await this.statusService.update<Language>(transaction, Language4Status, id, status);

      return transaction.findOne(Language, {
        where: { id },
        relations: this.relations,
      });
    });

    return this.toView(language);
  }

  @Delete(':id')
  @CheckId(Language)
  @CheckMethodAccess(AccessEntity.LANGUAGE, AccessMethod.DELETE)
  async remove(
    @Param('id')
    id: string,
  ): Promise<void> {
    await this.languageRepository.delete(id);
  }
}
