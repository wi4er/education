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
import { Repository } from 'typeorm';
import { Access } from '../entities/access/access.entity';
import { AccessView } from '../views/access.view';
import { AccessInput } from '../inputs/access.input';

@Controller('access')
export class AccessController {

  constructor(
    @InjectRepository(Access)
    private readonly accessRepository: Repository<Access>,
  ) {}

  toView(access: Access): AccessView {
    return {
      id: access.id,
      group: access.groupId,
      entity: access.entity,
      method: access.method,
    };
  }

  @Get()
  @CheckMethodAccess(AccessEntity.ACCESS, AccessMethod.GET)
  async findAll(): Promise<AccessView[]> {
    const accesses = await this.accessRepository.find();

    return accesses.map((a) => this.toView(a));
  }

  @Get(':id')
  @CheckId(Access)
  @CheckMethodAccess(AccessEntity.ACCESS, AccessMethod.GET)
  async findOne(
    @Param('id')
    id: number,
  ): Promise<AccessView> {
    const access = await this.accessRepository.findOne({
      where: { id },
    });

    return this.toView(access);
  }

  @Post()
  @CheckMethodAccess(AccessEntity.ACCESS, AccessMethod.POST)
  async create(
    @Body()
    data: AccessInput,
  ): Promise<AccessView> {
    const access = this.accessRepository.create(data);
    const saved = await this.accessRepository.save(access);

    return this.toView(saved);
  }

  @Put(':id')
  @CheckId(Access)
  @CheckMethodAccess(AccessEntity.ACCESS, AccessMethod.PUT)
  async update(
    @Param('id')
    id: number,
    @Body()
    data: AccessInput,
  ): Promise<AccessView> {
    await this.accessRepository.update(id, data);
    const access = await this.accessRepository.findOne({
      where: { id },
    });

    return this.toView(access);
  }

  @Delete(':id')
  @CheckId(Access)
  @CheckMethodAccess(AccessEntity.ACCESS, AccessMethod.DELETE)
  async remove(
    @Param('id')
    id: number,
  ): Promise<void> {
    await this.accessRepository.delete(id);
  }

}
