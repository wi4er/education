import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Block } from './entities/block/block.entity';
import { Element } from './entities/element/element.entity';
import { Section } from './entities/section/section.entity';
import { BlockController } from './controllers/block.controller';
import { ElementController } from './controllers/element.controller';
import { SectionController } from './controllers/section.controller';
import { SectionService } from './services/section.service';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Block, Element, Section]),
    CommonModule,
  ],
  controllers: [
    BlockController,
    ElementController,
    SectionController,
  ],
  providers: [
    SectionService,
  ],
})
export class ContentModule {}
