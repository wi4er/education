import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { DataSource, Repository, EntityTarget } from 'typeorm';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';
import { FileController } from './file.controller';
import { File } from '../entities/file/file.entity';
import { Collection } from '../entities/collection/collection.entity';
import { Collection4Permission } from '../entities/collection/collection4permission.entity';
import { Attribute } from '../../settings/entities/attribute/attribute.entity';
import { Group } from '../../personal/entities/group/group.entity';
import { TestDbModule } from '../../tests/test-db.module';
import { ExceptionModule } from '../../exception/exception.module';
import { CommonModule } from '../../common/common.module';
import { PermissionMethod } from '../../common/permission/permission.method';

const JWT_SECRET = 'test-secret';

describe('FileController', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let jwtService: JwtService;
  let repo: <T>(target: EntityTarget<T>) => Repository<T>;

  beforeAll(() => {
    process.env.JWT_SECRET = JWT_SECRET;
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TestDbModule,
        ExceptionModule,
        CommonModule,
        TypeOrmModule.forFeature([File, Collection]),
        JwtModule.register({ secret: JWT_SECRET }),
      ],
      controllers: [FileController],
      providers: [],
    }).compile();

    app = module.createNestApplication();
    app.use(cookieParser());
    dataSource = module.get<DataSource>(DataSource);
    jwtService = module.get<JwtService>(JwtService);
    await app.init();

    repo = dataSource.getRepository.bind(dataSource);

    await repo(Group).save({ id: 'admin' });
    await repo(Collection).save({ id: 'default-col' });
    await repo(Collection4Permission).save({
      parentId: 'default-col',
      method: PermissionMethod.ALL,
      groupId: null,
    });
  });

  afterEach(() => app.close());

  describe('GET /file', () => {
    it('should return an empty array when no files exist', async () => {
      const response = await request(app.getHttpServer())
        .get('/file')
        .expect(200);

      expect(response.body).toEqual({ data: [], count: 0 });
    });

    it('should return an array of files with relations', async () => {
      await repo(File).save({
        id: 'file-1',
        parentId: 'default-col',
        path: '/storage/file1.jpg',
        original: 'photo.jpg',
      });

      const response = await request(app.getHttpServer())
        .get('/file')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].id).toBe('file-1');
      expect(response.body.data[0].parentId).toBe('default-col');
      expect(response.body.data[0].path).toBe('/storage/file1.jpg');
      expect(response.body.data[0].original).toBe('photo.jpg');
      expect(response.body.data[0].attributes).toEqual({
        strings: [],
        points: [],
      });
      expect(response.body.data[0].status).toEqual([]);
    });

    it('should filter files by parentId', async () => {
      await repo(Collection).save({ id: 'other-col' });
      await repo(Collection4Permission).save({
        parentId: 'default-col',
        method: PermissionMethod.READ,
        groupId: null,
      });
      await repo(File).save({
        id: 'file-1',
        parentId: 'default-col',
        path: '/storage/file1.jpg',
        original: 'file1.jpg',
      });
      await repo(File).save({
        id: 'file-2',
        parentId: 'other-col',
        path: '/storage/file2.jpg',
        original: 'file2.jpg',
      });

      const response = await request(app.getHttpServer())
        .get('/file?parentId=default-col')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].id).toBe('file-1');
    });
  });

  describe('GET /file with pagination', () => {
    it('should return limited files when limit is provided', async () => {
      await repo(File).save({ id: 'file-1', parentId: 'default-col', path: '/f1', original: 'f1' });
      await repo(File).save({ id: 'file-2', parentId: 'default-col', path: '/f2', original: 'f2' });
      await repo(File).save({ id: 'file-3', parentId: 'default-col', path: '/f3', original: 'f3' });

      const response = await request(app.getHttpServer())
        .get('/file?limit=2')
        .expect(200);

      expect(response.body.data).toHaveLength(2);
    });

    it('should skip files when offset is provided', async () => {
      await repo(File).save({ id: 'file-1', parentId: 'default-col', path: '/f1', original: 'f1' });
      await repo(File).save({ id: 'file-2', parentId: 'default-col', path: '/f2', original: 'f2' });
      await repo(File).save({ id: 'file-3', parentId: 'default-col', path: '/f3', original: 'f3' });

      const response = await request(app.getHttpServer())
        .get('/file?offset=1')
        .expect(200);

      expect(response.body.data).toHaveLength(2);
    });

    it('should return paginated files when both limit and offset are provided', async () => {
      await repo(File).save({ id: 'file-1', parentId: 'default-col', path: '/f1', original: 'f1' });
      await repo(File).save({ id: 'file-2', parentId: 'default-col', path: '/f2', original: 'f2' });
      await repo(File).save({ id: 'file-3', parentId: 'default-col', path: '/f3', original: 'f3' });
      await repo(File).save({ id: 'file-4', parentId: 'default-col', path: '/f4', original: 'f4' });

      const response = await request(app.getHttpServer())
        .get('/file?limit=2&offset=1')
        .expect(200);

      expect(response.body.data).toHaveLength(2);
    });

    it('should return empty array when offset exceeds total files', async () => {
      await repo(File).save({ id: 'file-1', parentId: 'default-col', path: '/f1', original: 'f1' });

      const response = await request(app.getHttpServer())
        .get('/file?offset=10')
        .expect(200);

      expect(response.body.data).toEqual([]);
    });
  });

  describe('GET /file/:id', () => {
    it('should return 404 for non-existent file', async () => {
      const response = await request(app.getHttpServer())
        .get('/file/non-existent-id')
        .expect(404);

      expect(response.body.message).toBe(
        'File with id non-existent-id not found',
      );
      expect(response.body.details).toEqual({
        entity: 'File',
        id: 'non-existent-id',
      });
    });

    it('should return a single file with relations', async () => {
      await repo(File).save({
        id: 'file-1',
        parentId: 'default-col',
        path: '/storage/file1.jpg',
        original: 'photo.jpg',
      });

      const response = await request(app.getHttpServer())
        .get('/file/file-1')
        .expect(200);

      expect(response.body.id).toBe('file-1');
      expect(response.body.parentId).toBe('default-col');
      expect(response.body.path).toBe('/storage/file1.jpg');
      expect(response.body.original).toBe('photo.jpg');
      expect(response.body.attributes).toEqual({
        strings: [],
        points: [],
      });
      expect(response.body.status).toEqual([]);
    });
  });

  describe('POST /file', () => {
    it('should create and return a new file', async () => {
      const response = await request(app.getHttpServer())
        .post('/file')
        .send({
          id: 'new-file',
          parentId: 'default-col',
          path: '/storage/new-file.jpg',
          original: 'upload.jpg',
        })
        .expect(201);

      expect(response.body.id).toBe('new-file');
      expect(response.body.parentId).toBe('default-col');
      expect(response.body.path).toBe('/storage/new-file.jpg');
      expect(response.body.original).toBe('upload.jpg');
      expect(response.body.attributes).toEqual({
        strings: [],
        points: [],
      });

      const found = await repo(File).findOne({ where: { id: 'new-file' } });
      expect(found).not.toBeNull();
    });

    it('should create file with strings', async () => {
      await repo(Attribute).save({ id: 'alt' });

      const response = await request(app.getHttpServer())
        .post('/file')
        .send({
          id: 'new-file',
          parentId: 'default-col',
          path: '/storage/new-file.jpg',
          original: 'upload.jpg',
          strings: [{ attr: 'alt', value: 'Alt text for image' }],
        })
        .expect(201);

      expect(response.body.id).toBe('new-file');
      expect(response.body.attributes.strings).toHaveLength(1);
      expect(response.body.attributes.strings[0]).toEqual({
        lang: null,
        attr: 'alt',
        value: 'Alt text for image',
      });
    });
  });

  describe('PUT /file/:id', () => {
    it('should return 404 for non-existent file', async () => {
      const response = await request(app.getHttpServer())
        .put('/file/non-existent-id')
        .send({
          parentId: 'default-col',
          path: '/storage/file.jpg',
          original: 'file.jpg',
        })
        .expect(404);

      expect(response.body.message).toBe(
        'File with id non-existent-id not found',
      );
      expect(response.body.details).toEqual({
        entity: 'File',
        id: 'non-existent-id',
      });
    });

    it('should update and return the file', async () => {
      await repo(File).save({
        id: 'file-1',
        parentId: 'default-col',
        path: '/storage/file1.jpg',
        original: 'photo.jpg',
      });

      const response = await request(app.getHttpServer())
        .put('/file/file-1')
        .send({
          parentId: 'default-col',
          path: '/storage/updated.jpg',
          original: 'updated.jpg',
        })
        .expect(200);

      expect(response.body.id).toBe('file-1');
      expect(response.body.path).toBe('/storage/updated.jpg');
      expect(response.body.original).toBe('updated.jpg');
    });

    it('should update file strings', async () => {
      await repo(Attribute).save({ id: 'alt' });
      await repo(File).save({
        id: 'file-1',
        parentId: 'default-col',
        path: '/storage/file1.jpg',
        original: 'photo.jpg',
      });

      const response = await request(app.getHttpServer())
        .put('/file/file-1')
        .send({
          parentId: 'default-col',
          path: '/storage/file1.jpg',
          original: 'photo.jpg',
          strings: [{ attr: 'alt', value: 'Updated alt text' }],
        })
        .expect(200);

      expect(response.body.attributes.strings).toHaveLength(1);
      expect(response.body.attributes.strings[0].value).toBe('Updated alt text');
    });
  });

  describe('DELETE /file/:id', () => {
    it('should return 404 for non-existent file', async () => {
      const response = await request(app.getHttpServer())
        .delete('/file/non-existent-id')
        .expect(404);

      expect(response.body.message).toBe(
        'File with id non-existent-id not found',
      );
      expect(response.body.details).toEqual({
        entity: 'File',
        id: 'non-existent-id',
      });
    });

    it('should delete the file', async () => {
      await repo(File).save({
        id: 'file-1',
        parentId: 'default-col',
        path: '/storage/file1.jpg',
        original: 'photo.jpg',
      });

      await request(app.getHttpServer())
        .delete('/file/file-1')
        .expect(200);

      const found = await repo(File).findOne({ where: { id: 'file-1' } });
      expect(found).toBeNull();
    });

    it('should delete file when parent collection is deleted', async () => {
      await repo(File).save({
        id: 'file-1',
        parentId: 'default-col',
        path: '/storage/file1.jpg',
        original: 'photo.jpg',
      });

      await repo(Collection).delete('default-col');

      const found = await repo(File).findOne({ where: { id: 'file-1' } });
      expect(found).toBeNull();
    });
  });

  describe('Parent collection permissions', () => {
    beforeEach(async () => {
      await repo(Collection).save({ id: 'perm-col' });
      await repo(Group).save({ id: 'editors' });
    });

    describe('GET /file (list)', () => {
      it('should return files from collections with public READ permission', async () => {
        await repo(Collection4Permission).save({
          parentId: 'perm-col',
          method: PermissionMethod.READ,
          groupId: null,
        });
        await repo(File).save({
          id: 'file-1',
          parentId: 'perm-col',
          path: '/storage/file1.jpg',
          original: 'photo.jpg',
        });

        const response = await request(app.getHttpServer())
          .get('/file')
          .expect(200);

        expect(response.body.data).toHaveLength(1);
        expect(response.body.data[0].id).toBe('file-1');
      });

      it('should return files when user has group READ permission on parent collection', async () => {
        await repo(Collection4Permission).save({
          parentId: 'perm-col',
          method: PermissionMethod.READ,
          groupId: 'editors',
        });
        await repo(File).save({
          id: 'file-1',
          parentId: 'perm-col',
          path: '/storage/file1.jpg',
          original: 'photo.jpg',
        });

        const token = jwtService.sign({ groups: ['editors'] });

        const response = await request(app.getHttpServer())
          .get('/file')
          .set('Cookie', [`auth_token=${token}`])
          .expect(200);

        expect(response.body.data).toHaveLength(1);
        expect(response.body.data[0].id).toBe('file-1');
      });

      it('should return files when parent collection has ALL permission', async () => {
        await repo(Collection4Permission).save({
          parentId: 'perm-col',
          method: PermissionMethod.ALL,
          groupId: null,
        });
        await repo(File).save({
          id: 'file-1',
          parentId: 'perm-col',
          path: '/storage/file1.jpg',
          original: 'photo.jpg',
        });

        const response = await request(app.getHttpServer())
          .get('/file')
          .expect(200);

        expect(response.body.data).toHaveLength(1);
        expect(response.body.data[0].id).toBe('file-1');
      });

      it('should return empty array when parent collection has no READ permission', async () => {
        await repo(File).save({
          id: 'file-1',
          parentId: 'perm-col',
          path: '/storage/file1.jpg',
          original: 'photo.jpg',
        });

        const response = await request(app.getHttpServer())
          .get('/file')
          .expect(200);

        expect(response.body).toEqual({ data: [], count: 0 });
      });

      it('should return empty array when user group does not match permission group', async () => {
        await repo(Collection4Permission).save({
          parentId: 'perm-col',
          method: PermissionMethod.READ,
          groupId: 'editors',
        });
        await repo(File).save({
          id: 'file-1',
          parentId: 'perm-col',
          path: '/storage/file1.jpg',
          original: 'photo.jpg',
        });

        const token = jwtService.sign({ groups: ['viewers'] });

        const response = await request(app.getHttpServer())
          .get('/file')
          .set('Cookie', [`auth_token=${token}`])
          .expect(200);

        expect(response.body).toEqual({ data: [], count: 0 });
      });

      it('should not return files from collections with only WRITE permission', async () => {
        await repo(Collection4Permission).save({
          parentId: 'perm-col',
          method: PermissionMethod.WRITE,
          groupId: null,
        });
        await repo(File).save({
          id: 'file-1',
          parentId: 'perm-col',
          path: '/storage/file1.jpg',
          original: 'photo.jpg',
        });

        const response = await request(app.getHttpServer())
          .get('/file')
          .expect(200);

        expect(response.body).toEqual({ data: [], count: 0 });
      });

      it('should return files from multiple collections with permission', async () => {
        await repo(Collection).save({ id: 'col-2' });
        await repo(Collection4Permission).save({
          parentId: 'perm-col',
          method: PermissionMethod.READ,
          groupId: null,
        });
        await repo(Collection4Permission).save({
          parentId: 'col-2',
          method: PermissionMethod.READ,
          groupId: null,
        });
        await repo(File).save({
          id: 'file-1',
          parentId: 'perm-col',
          path: '/storage/file1.jpg',
          original: 'photo1.jpg',
        });
        await repo(File).save({
          id: 'file-2',
          parentId: 'col-2',
          path: '/storage/file2.jpg',
          original: 'photo2.jpg',
        });

        const response = await request(app.getHttpServer())
          .get('/file')
          .expect(200);

        expect(response.body.data).toHaveLength(2);
        expect(response.body.data.map(f => f.id)).toContain('file-1');
        expect(response.body.data.map(f => f.id)).toContain('file-2');
      });

      it('should only return files from collections user has access to', async () => {
        await repo(Collection).save({ id: 'col-2' });
        await repo(Collection4Permission).save({
          parentId: 'perm-col',
          method: PermissionMethod.READ,
          groupId: 'editors',
        });
        await repo(Collection4Permission).save({
          parentId: 'col-2',
          method: PermissionMethod.READ,
          groupId: null,
        });
        await repo(File).save({
          id: 'file-1',
          parentId: 'perm-col',
          path: '/storage/file1.jpg',
          original: 'photo1.jpg',
        });
        await repo(File).save({
          id: 'file-2',
          parentId: 'col-2',
          path: '/storage/file2.jpg',
          original: 'photo2.jpg',
        });

        // User without 'editors' group should only see file-2
        const token = jwtService.sign({ groups: ['viewers'] });

        const response = await request(app.getHttpServer())
          .get('/file')
          .set('Cookie', [`auth_token=${token}`])
          .expect(200);

        expect(response.body.data).toHaveLength(1);
        expect(response.body.data[0].id).toBe('file-2');
      });
    });

    describe('GET /file/:id', () => {
      it('should return file when parent collection has public READ permission', async () => {
        await repo(Collection4Permission).save({
          parentId: 'perm-col',
          method: PermissionMethod.READ,
          groupId: null,
        });
        await repo(File).save({
          id: 'file-1',
          parentId: 'perm-col',
          path: '/storage/file1.jpg',
          original: 'photo.jpg',
        });

        const response = await request(app.getHttpServer())
          .get('/file/file-1')
          .expect(200);

        expect(response.body.id).toBe('file-1');
      });

      it('should return file when user has group READ permission on parent collection', async () => {
        await repo(Collection4Permission).save({
          parentId: 'perm-col',
          method: PermissionMethod.READ,
          groupId: 'editors',
        });
        await repo(File).save({
          id: 'file-1',
          parentId: 'perm-col',
          path: '/storage/file1.jpg',
          original: 'photo.jpg',
        });

        const token = jwtService.sign({ groups: ['editors'] });

        const response = await request(app.getHttpServer())
          .get('/file/file-1')
          .set('Cookie', [`auth_token=${token}`])
          .expect(200);

        expect(response.body.id).toBe('file-1');
      });

      it('should return 403 when parent collection has no READ permission', async () => {
        await repo(File).save({
          id: 'file-1',
          parentId: 'perm-col',
          path: '/storage/file1.jpg',
          original: 'photo.jpg',
        });

        const response = await request(app.getHttpServer())
          .get('/file/file-1')
          .expect(403);

        expect(response.body.message).toContain('Permission denied');
      });

      it('should return 403 when user group does not match permission group', async () => {
        await repo(Collection4Permission).save({
          parentId: 'perm-col',
          method: PermissionMethod.READ,
          groupId: 'editors',
        });
        await repo(File).save({
          id: 'file-1',
          parentId: 'perm-col',
          path: '/storage/file1.jpg',
          original: 'photo.jpg',
        });

        const token = jwtService.sign({ groups: ['viewers'] });

        const response = await request(app.getHttpServer())
          .get('/file/file-1')
          .set('Cookie', [`auth_token=${token}`])
          .expect(403);

        expect(response.body.message).toContain('Permission denied');
      });
    });

    describe('POST /file', () => {
      it('should create file when parent collection has public WRITE permission', async () => {
        await repo(Collection4Permission).save({
          parentId: 'perm-col',
          method: PermissionMethod.WRITE,
          groupId: null,
        });

        const response = await request(app.getHttpServer())
          .post('/file')
          .send({
            id: 'new-file',
            parentId: 'perm-col',
            path: '/storage/new.jpg',
            original: 'new.jpg',
          })
          .expect(201);

        expect(response.body.id).toBe('new-file');
      });

      it('should create file when user has group WRITE permission on parent collection', async () => {
        await repo(Collection4Permission).save({
          parentId: 'perm-col',
          method: PermissionMethod.WRITE,
          groupId: 'editors',
        });

        const token = jwtService.sign({ groups: ['editors'] });

        const response = await request(app.getHttpServer())
          .post('/file')
          .send({
            id: 'new-file',
            parentId: 'perm-col',
            path: '/storage/new.jpg',
            original: 'new.jpg',
          })
          .set('Cookie', [`auth_token=${token}`])
          .expect(201);

        expect(response.body.id).toBe('new-file');
      });

      it('should create file when parent collection has ALL permission', async () => {
        await repo(Collection4Permission).save({
          parentId: 'perm-col',
          method: PermissionMethod.ALL,
          groupId: null,
        });

        const response = await request(app.getHttpServer())
          .post('/file')
          .send({
            id: 'new-file',
            parentId: 'perm-col',
            path: '/storage/new.jpg',
            original: 'new.jpg',
          })
          .expect(201);

        expect(response.body.id).toBe('new-file');
      });

      it('should return 403 when parent collection has no WRITE permission', async () => {
        const response = await request(app.getHttpServer())
          .post('/file')
          .send({
            id: 'new-file',
            parentId: 'perm-col',
            path: '/storage/new.jpg',
            original: 'new.jpg',
          })
          .expect(403);

        expect(response.body.message).toContain('Permission denied');
      });

      it('should return 403 when parent collection only has READ permission', async () => {
        await repo(Collection4Permission).save({
          parentId: 'perm-col',
          method: PermissionMethod.READ,
          groupId: null,
        });

        const response = await request(app.getHttpServer())
          .post('/file')
          .send({
            id: 'new-file',
            parentId: 'perm-col',
            path: '/storage/new.jpg',
            original: 'new.jpg',
          })
          .expect(403);

        expect(response.body.message).toContain('Permission denied');
      });
    });

    describe('PUT /file/:id', () => {
      it('should update file when parent collection has public WRITE permission', async () => {
        await repo(Collection4Permission).save({
          parentId: 'perm-col',
          method: PermissionMethod.WRITE,
          groupId: null,
        });
        await repo(File).save({
          id: 'file-1',
          parentId: 'perm-col',
          path: '/storage/file1.jpg',
          original: 'photo.jpg',
        });

        const response = await request(app.getHttpServer())
          .put('/file/file-1')
          .send({
            parentId: 'perm-col',
            path: '/storage/updated.jpg',
            original: 'updated.jpg',
          })
          .expect(200);

        expect(response.body.path).toBe('/storage/updated.jpg');
      });

      it('should update file when user has group WRITE permission on parent collection', async () => {
        await repo(Collection4Permission).save({
          parentId: 'perm-col',
          method: PermissionMethod.WRITE,
          groupId: 'editors',
        });
        await repo(File).save({
          id: 'file-1',
          parentId: 'perm-col',
          path: '/storage/file1.jpg',
          original: 'photo.jpg',
        });

        const token = jwtService.sign({ groups: ['editors'] });

        const response = await request(app.getHttpServer())
          .put('/file/file-1')
          .send({
            parentId: 'perm-col',
            path: '/storage/updated.jpg',
            original: 'updated.jpg',
          })
          .set('Cookie', [`auth_token=${token}`])
          .expect(200);

        expect(response.body.path).toBe('/storage/updated.jpg');
      });

      it('should return 403 when parent collection has no WRITE permission', async () => {
        await repo(File).save({
          id: 'file-1',
          parentId: 'perm-col',
          path: '/storage/file1.jpg',
          original: 'photo.jpg',
        });

        const response = await request(app.getHttpServer())
          .put('/file/file-1')
          .send({
            parentId: 'perm-col',
            path: '/storage/updated.jpg',
            original: 'updated.jpg',
          })
          .expect(403);

        expect(response.body.message).toContain('Permission denied');
      });

      it('should return 403 when parent collection only has READ permission', async () => {
        await repo(Collection4Permission).save({
          parentId: 'perm-col',
          method: PermissionMethod.READ,
          groupId: null,
        });
        await repo(File).save({
          id: 'file-1',
          parentId: 'perm-col',
          path: '/storage/file1.jpg',
          original: 'photo.jpg',
        });

        const response = await request(app.getHttpServer())
          .put('/file/file-1')
          .send({
            parentId: 'perm-col',
            path: '/storage/updated.jpg',
            original: 'updated.jpg',
          })
          .expect(403);

        expect(response.body.message).toContain('Permission denied');
      });
    });

    describe('DELETE /file/:id', () => {
      it('should delete file when parent collection has public DELETE permission', async () => {
        await repo(Collection4Permission).save({
          parentId: 'perm-col',
          method: PermissionMethod.DELETE,
          groupId: null,
        });
        await repo(File).save({
          id: 'file-1',
          parentId: 'perm-col',
          path: '/storage/file1.jpg',
          original: 'photo.jpg',
        });

        await request(app.getHttpServer())
          .delete('/file/file-1')
          .expect(200);

        const found = await repo(File).findOne({ where: { id: 'file-1' } });
        expect(found).toBeNull();
      });

      it('should delete file when user has group DELETE permission on parent collection', async () => {
        await repo(Collection4Permission).save({
          parentId: 'perm-col',
          method: PermissionMethod.DELETE,
          groupId: 'editors',
        });
        await repo(File).save({
          id: 'file-1',
          parentId: 'perm-col',
          path: '/storage/file1.jpg',
          original: 'photo.jpg',
        });

        const token = jwtService.sign({ groups: ['editors'] });

        await request(app.getHttpServer())
          .delete('/file/file-1')
          .set('Cookie', [`auth_token=${token}`])
          .expect(200);

        const found = await repo(File).findOne({ where: { id: 'file-1' } });
        expect(found).toBeNull();
      });

      it('should delete file when parent collection has ALL permission', async () => {
        await repo(Collection4Permission).save({
          parentId: 'perm-col',
          method: PermissionMethod.ALL,
          groupId: null,
        });
        await repo(File).save({
          id: 'file-1',
          parentId: 'perm-col',
          path: '/storage/file1.jpg',
          original: 'photo.jpg',
        });

        await request(app.getHttpServer())
          .delete('/file/file-1')
          .expect(200);

        const found = await repo(File).findOne({ where: { id: 'file-1' } });
        expect(found).toBeNull();
      });

      it('should return 403 when parent collection has no DELETE permission', async () => {
        await repo(File).save({
          id: 'file-1',
          parentId: 'perm-col',
          path: '/storage/file1.jpg',
          original: 'photo.jpg',
        });

        const response = await request(app.getHttpServer())
          .delete('/file/file-1')
          .expect(403);

        expect(response.body.message).toContain('Permission denied');
      });

      it('should return 403 when parent collection only has WRITE permission', async () => {
        await repo(Collection4Permission).save({
          parentId: 'perm-col',
          method: PermissionMethod.WRITE,
          groupId: null,
        });
        await repo(File).save({
          id: 'file-1',
          parentId: 'perm-col',
          path: '/storage/file1.jpg',
          original: 'photo.jpg',
        });

        const response = await request(app.getHttpServer())
          .delete('/file/file-1')
          .expect(403);

        expect(response.body.message).toContain('Permission denied');
      });
    });
  });
});
