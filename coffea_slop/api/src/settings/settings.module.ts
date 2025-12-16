import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attribute } from './entities/attribute/attribute.entity';
import { Language } from './entities/language/language.entity';
import { AttributeController } from './controllers/attribute.controller';
import { LanguageController } from './controllers/language.controller';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Attribute, Language]),
    CommonModule,
  ],
  controllers: [
    AttributeController,
    LanguageController,
  ],
})
export class SettingsModule {}
