import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Form } from './entities/form/form.entity';
import { Form2File } from './entities/form/form2file.entity';
import { Form4Status } from './entities/form/form4status.entity';
import { Result } from './entities/result/result.entity';
import { FormController } from './controllers/form.controller';
import { ResultController } from './controllers/result.controller';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Form, Form2File, Form4Status, Result]),
    CommonModule,
  ],
  controllers: [FormController, ResultController],
})
export class FeedbackModule {}
