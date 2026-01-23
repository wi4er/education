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
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Result } from '../entities/result/result.entity';
import { ResultView } from '../views/result.view';
import { ResultInput } from '../inputs/result.input';

@Controller('result')
export class ResultController {
  constructor(
    @InjectRepository(Result)
    private readonly resultRepository: Repository<Result>,
  ) {}

  toView(result: Result): ResultView {
    return {
      id: result.id,
      formId: result.formId,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    };
  }

  @Get()
  @CheckMethodAccess(AccessEntity.RESULT, AccessMethod.GET)
  async findAll(
    @Query('limit')
    limit?: number,
    @Query('offset')
    offset?: number,
  ): Promise<{ data: ResultView[]; count: number }> {
    const [results, count] = await this.resultRepository.findAndCount({
      take: limit,
      skip: offset,
    });
    return {
      data: results.map((result) => this.toView(result)),
      count,
    };
  }

  @Get(':id')
  @CheckId(Result)
  @CheckMethodAccess(AccessEntity.RESULT, AccessMethod.GET)
  async findOne(
    @Param('id')
    id: string,
  ): Promise<ResultView> {
    const result = await this.resultRepository.findOne({
      where: { id },
    });
    return this.toView(result);
  }

  @Post()
  @CheckMethodAccess(AccessEntity.RESULT, AccessMethod.POST)
  async create(
    @Body()
    data: ResultInput,
  ): Promise<ResultView> {
    const result = this.resultRepository.create(data);
    const savedResult = await this.resultRepository.save(result);
    return this.toView(savedResult);
  }

  @Put(':id')
  @CheckId(Result)
  @CheckMethodAccess(AccessEntity.RESULT, AccessMethod.PUT)
  async update(
    @Param('id')
    id: string,
    @Body()
    data: ResultInput,
  ): Promise<ResultView> {
    await this.resultRepository.update(id, data);
    const result = await this.resultRepository.findOne({
      where: { id },
    });
    return this.toView(result);
  }

  @Delete(':id')
  @CheckId(Result)
  @CheckMethodAccess(AccessEntity.RESULT, AccessMethod.DELETE)
  async remove(
    @Param('id')
    id: string,
  ): Promise<void> {
    await this.resultRepository.delete(id);
  }
}
