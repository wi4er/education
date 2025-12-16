import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Form } from './entities/form/form.entity';
import { Result } from './entities/result/result.entity';
import { FormController } from './controllers/form.controller';
import { ResultController } from './controllers/result.controller';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Form, Result]),
    CommonModule,
  ],
  controllers: [
    FormController,
    ResultController,
  ],
})
export class FeedbackModule {}
