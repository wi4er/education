import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Collection} from './entities/collection/collection.entity';
import {Collection4Status} from './entities/collection/collection4status.entity';
import {File} from './entities/file/file.entity';
import {File4Status} from './entities/file/file4status.entity';
import {CollectionController} from './controllers/collection.controller';
import {FileController} from './controllers/file.controller';
import {UploadController} from './controllers/upload.controller';
import {CommonModule} from '../common/common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Collection,
      Collection4Status,
      File,
      File4Status,
    ]),
    CommonModule,
  ],
  controllers: [CollectionController, FileController, UploadController],
  providers: [],
})
export class StorageModule {}
