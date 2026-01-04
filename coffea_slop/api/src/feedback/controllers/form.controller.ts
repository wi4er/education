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
import {CheckIdPermission} from '../../common/permission/check-id-permission.guard';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository, DataSource, In, IsNull, Or} from 'typeorm';
import {CurrentGroups} from '../../personal/decorators/current-groups.decorator';
import {PermissionMethod} from '../../common/permission/permission.method';
import {Form} from '../entities/form/form.entity';
import {Form2String} from '../entities/form/form2string.entity';
import {Form2Point} from '../entities/form/form2point.entity';
import {Form4Permission} from '../entities/form/form4permission.entity';
import {Form2Description} from '../entities/form/form2description.entity';
import {Form2Counter} from '../entities/form/form2counter.entity';
import {Form2File} from '../entities/form/form2file.entity';
import {FormView} from '../views/form.view';
import {FormInput} from '../inputs/form.input';
import {PointAttributeService} from '../../common/services/point-attribute.service';
import {StringAttributeService} from '../../common/services/string-attribute.service';
import {PermissionService} from '../../common/services/permission.service';
import {DescriptionAttributeService} from '../../common/services/description-attribute.service';
import {CounterAttributeService} from '../../common/services/counter-attribute.service';
import {FileAttributeService} from '../../common/services/file-attribute.service';
import {StatusService} from '../../common/services/status.service';
import {Form4Status} from '../entities/form/form4status.entity';

@Controller('form')
export class FormController {

  private readonly relations = [
    'strings',
    'points',
    'permissions',
    'descriptions',
    'counters',
    'files',
    'statuses',
  ];

  constructor(
    @InjectRepository(Form)
    private readonly formRepository: Repository<Form>,
    private readonly dataSource: DataSource,
    private readonly pointAttributeService: PointAttributeService,
    private readonly stringAttributeService: StringAttributeService,
    private readonly permissionService: PermissionService,
    private readonly descriptionAttributeService: DescriptionAttributeService,
    private readonly counterAttributeService: CounterAttributeService,
    private readonly fileAttributeService: FileAttributeService,
    private readonly statusService: StatusService,
  ) {
  }

  toView(form: Form): FormView {
    return {
      id: form.id,
      createdAt: form.createdAt,
      updatedAt: form.updatedAt,
      attributes: {
        strings: form.strings?.map((str) => ({
          lang: str.languageId,
          attr: str.attributeId,
          value: str.value,
        })) ?? [],
        points: form.points?.map((pnt) => ({
          attr: pnt.attributeId,
          pnt: pnt.pointId,
        })) ?? [],
        descriptions: form.descriptions?.map((desc) => ({
          lang: desc.languageId,
          attr: desc.attributeId,
          value: desc.value,
        })) ?? [],
        counters: form.counters?.map((cnt) => ({
          attr: cnt.attributeId,
          pnt: cnt.pointId,
          msr: cnt.measureId,
          count: cnt.count,
        })) ?? [],
        files: form.files?.map((f) => ({
          attr: f.attributeId,
          file: f.fileId,
        })) ?? [],
      },
      permissions: form.permissions?.map((perm) => ({
        group: perm.groupId,
        method: perm.method,
      })) ?? [],
      status: form.statuses?.map((s) => s.statusId) ?? [],
    };
  }

  @Get()
  @CheckMethodAccess(AccessEntity.FORM, AccessMethod.GET)
  async findAll(
    @CurrentGroups()
    groups: string[],
    @Query('limit')
    limit?: number,
    @Query('offset')
    offset?: number,
  ): Promise<FormView[]> {
    const forms = await this.formRepository.find({
      where: {
        permissions: {
          groupId: Or(In(groups), IsNull()),
          method: In([PermissionMethod.READ, PermissionMethod.ALL]),
        },
      },
      relations: this.relations,
      take: limit,
      skip: offset,
    });
    return forms.map((form) => this.toView(form));
  }

  @Get(':id')
  @CheckId(Form)
  @CheckMethodAccess(AccessEntity.FORM, AccessMethod.GET)
  @CheckIdPermission(Form, PermissionMethod.READ)
  async findOne(
    @Param('id')
    id: string,
  ): Promise<FormView> {
    const form = await this.formRepository.findOne({
      where: { id },
      relations: this.relations,
    });
    return this.toView(form);
  }

  @Post()
  @CheckMethodAccess(AccessEntity.FORM, AccessMethod.POST)
  async create(
    @Body()
    data: FormInput,
  ): Promise<FormView> {
    const {
      strings,
      points,
      permissions,
      descriptions,
      counters,
      files,
      status,
      ...formData
    } = data;

    const form = await this.dataSource.transaction(async (transaction) => {
      const frm = transaction.create(Form, formData);
      const saved = await transaction.save(frm);

      await this.stringAttributeService.create<Form>(transaction, Form2String, saved.id, strings);
      await this.pointAttributeService.create<Form>(transaction, Form2Point, saved.id, points);
      await this.permissionService.create<Form>(transaction, Form4Permission, permissions, saved.id);
      await this.descriptionAttributeService.create<Form>(transaction, Form2Description, saved.id, descriptions);
      await this.counterAttributeService.create<Form>(transaction, Form2Counter, saved.id, counters);
      await this.fileAttributeService.create<Form>(transaction, Form2File, saved.id, files);
      await this.statusService.create<Form>(transaction, Form4Status, saved.id, status);

      return transaction.findOne(Form, {
        where: { id: saved.id },
        relations: this.relations,
      });
    });

    return this.toView(form);
  }

  @Put(':id')
  @CheckId(Form)
  @CheckMethodAccess(AccessEntity.FORM, AccessMethod.PUT)
  @CheckIdPermission(Form, PermissionMethod.WRITE)
  async update(
    @Param('id')
    id: string,
    @Body()
    data: FormInput,
  ): Promise<FormView> {
    const {
      strings,
      points,
      permissions,
      descriptions,
      counters,
      files,
      status,
      ...formData
    } = data;

    const form = await this.dataSource.transaction(async (transaction) => {
      await transaction.update(Form, id, formData);

      await this.stringAttributeService.update<Form>(transaction, Form2String, id, strings);
      await this.pointAttributeService.update<Form>(transaction, Form2Point, id, points);
      await this.permissionService.update<Form>(transaction, Form4Permission, id, permissions);
      await this.descriptionAttributeService.update<Form>(transaction, Form2Description, id, descriptions);
      await this.counterAttributeService.update<Form>(transaction, Form2Counter, id, counters);
      await this.fileAttributeService.update<Form>(transaction, Form2File, id, files);
      await this.statusService.update<Form>(transaction, Form4Status, id, status);

      return transaction.findOne(Form, {
        where: { id },
        relations: this.relations,
      });
    });

    return this.toView(form);
  }

  @Delete(':id')
  @CheckId(Form)
  @CheckMethodAccess(AccessEntity.FORM, AccessMethod.DELETE)
  @CheckIdPermission(Form, PermissionMethod.DELETE)
  async remove(
    @Param('id')
    id: string,
  ): Promise<void> {
    await this.formRepository.delete(id);
  }
}
