import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Block } from './entities/block/block.entity';
import { Block4Status } from './entities/block/block4status.entity';
import { Element } from './entities/element/element.entity';
import { Element4Status } from './entities/element/element4status.entity';
import { Section } from './entities/section/section.entity';
import { Section4Status } from './entities/section/section4status.entity';
import { BlockController } from './controllers/block.controller';
import { ElementController } from './controllers/element.controller';
import { SectionController } from './controllers/section.controller';
import { SectionService } from './services/section.service';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Block,
      Block4Status,
      Element,
      Element4Status,
      Section,
      Section4Status,
    ]),
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
