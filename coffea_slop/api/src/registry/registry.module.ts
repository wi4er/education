import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Directory } from './entities/directory/directory.entity';
import { Directory4Status } from './entities/directory/directory4status.entity';
import { Point } from './entities/point/point.entity';
import { Point4Status } from './entities/point/point4status.entity';
import { Measure } from './entities/measure/measure.entity';
import { Measure4Status } from './entities/measure/measure4status.entity';
import { DirectoryController } from './controllers/directory.controller';
import { PointController } from './controllers/point.controller';
import { MeasureController } from './controllers/measure.controller';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Directory,
      Directory4Status,
      Point,
      Point4Status,
      Measure,
      Measure4Status,
    ]),
    CommonModule,
  ],
  controllers: [DirectoryController, PointController, MeasureController],
})
export class RegistryModule {}
