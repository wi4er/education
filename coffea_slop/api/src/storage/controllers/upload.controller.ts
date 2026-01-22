import {Controller, Post, Param, UseInterceptors, UploadedFile, BadRequestException} from '@nestjs/common';
import {FileInterceptor} from '@nestjs/platform-express';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {File} from '../entities/file/file.entity';
import {FileView} from '../views/file.view';
import {CheckId} from '../../common/check-id/check-id.guard';
import {CheckIdPermission} from '../../common/permission/check-id-permission.guard';
import {PermissionMethod} from '../../common/permission/permission.method';
import {Collection} from '../entities/collection/collection.entity';
import {uploadStorage} from '../services/upload.service';

@Controller('upload')
export class UploadController {

  constructor(
    @InjectRepository(File)
    private readonly fileRepository: Repository<File>,
  ) {}

  toView(file: File): FileView {
    return {
      id: file.id,
      parentId: file.parentId,
      path: file.path,
      original: file.original,
      createdAt: file.createdAt,
      updatedAt: file.updatedAt,
      attributes: {
        strings: [],
        points: [],
      },
      status: [],
    };
  }

  @Post(':collection_id')
  @CheckId(Collection, 'collection_id')
  @CheckIdPermission(Collection, PermissionMethod.WRITE, 'collection_id')
  @UseInterceptors(FileInterceptor('file', { storage: uploadStorage }))
  async upload(
    @Param('collection_id')
    collectionId: string,
    @UploadedFile()
    uploadedFile: Express.Multer.File,
  ): Promise<FileView> {
    if (!uploadedFile) {
      throw new BadRequestException('File is required');
    }

    const file = this.fileRepository.create({
      parentId: collectionId,
      path: uploadedFile.filename,
      original: uploadedFile.originalname,
    });

    console.log(file);

    const saved = await this.fileRepository.save(file);

    return this.toView(saved);
  }

}
