import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attribute } from './entities/attribute/attribute.entity';
import { Attribute2AsPoint } from './entities/attribute/attributeAsPoint.entity';
import { Language } from './entities/language/language.entity';
import { AttributeController } from './controllers/attribute.controller';
import { LanguageController } from './controllers/language.controller';
import { AsPointService } from './services/as-point.service';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Attribute, Attribute2AsPoint, Language]),
    CommonModule,
  ],
  controllers: [
    AttributeController,
    LanguageController,
  ],
  providers: [
    AsPointService,
  ],
})
export class SettingsModule {}
