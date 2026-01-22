import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Block} from './entities/block/block.entity';
import {Block2File} from './entities/block/block2file.entity';
import {Block4Status} from './entities/block/block4status.entity';
import {Block4Image} from './entities/block/block4image.entity';
import {Element} from './entities/element/element.entity';
import {Element2File} from './entities/element/element2file.entity';
import {Element4Image} from './entities/element/element4image.entity';
import {Element4Status} from './entities/element/element4status.entity';
import {Section} from './entities/section/section.entity';
import {Section2File} from './entities/section/section2file.entity';
import {Section4Status} from './entities/section/section4status.entity';
import {Section4Image} from './entities/section/section4image.entity';
import {BlockController} from './controllers/block.controller';
import {ElementController} from './controllers/element.controller';
import {SectionController} from './controllers/section.controller';
import {SectionService} from './services/section.service';
import {ElementFilterService} from './services/element-filter.service';
import {ElementSortService} from './services/element-sort.service';
import {CommonModule} from '../common/common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Block,
      Block2File,
      Block4Status,
      Block4Image,
      Element,
      Element2File,
      Element4Image,
      Element4Status,
      Section,
      Section2File,
      Section4Status,
      Section4Image,
    ]),
    CommonModule,
  ],
  controllers: [BlockController, ElementController, SectionController],
  providers: [SectionService, ElementFilterService, ElementSortService],
})
export class ContentModule {}
