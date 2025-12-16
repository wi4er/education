import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Directory } from './entities/directory/directory.entity';
import { Point } from './entities/point/point.entity';
import { Measure } from './entities/measure/measure.entity';
import { DirectoryController } from './controllers/directory.controller';
import { PointController } from './controllers/point.controller';
import { MeasureController } from './controllers/measure.controller';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Directory, Point, Measure]),
    CommonModule,
  ],
  controllers: [
    DirectoryController,
    PointController,
    MeasureController,
  ],
})
export class RegistryModule {}
