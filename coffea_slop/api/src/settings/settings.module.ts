import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attribute } from './entities/attribute/attribute.entity';
import { Attribute2AsPoint } from './entities/attribute/attributeAsPoint.entity';
import { Attribute4Status } from './entities/attribute/attribute4status.entity';
import { Language } from './entities/language/language.entity';
import { Language4Status } from './entities/language/language4status.entity';
import { Status } from './entities/status/status.entity';
import { Status2String } from './entities/status/status2string.entity';
import { Status2Point } from './entities/status/status2point.entity';
import { Status4Status } from './entities/status/status4status.entity';
import { AttributeController } from './controllers/attribute.controller';
import { LanguageController } from './controllers/language.controller';
import { StatusController } from './controllers/status.controller';
import { AsPointService } from './services/as-point.service';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Attribute,
      Attribute2AsPoint,
      Attribute4Status,
      Language,
      Language4Status,
      Status,
      Status2String,
      Status2Point,
      Status4Status,
    ]),
    CommonModule,
  ],
  controllers: [
    AttributeController,
    LanguageController,
    StatusController,
  ],
  providers: [
    AsPointService,
  ],
})
export class SettingsModule {}
