import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import * as request from 'supertest';
import { DirectoryController } from './directory.controller';
import { Directory } from '../entities/directory/directory.entity';
import { Attribute } from '../../settings/entities/attribute/attribute.entity';
import { PointAttributeService } from '../../common/services/point-attribute.service';
import { StringAttributeService } from '../../common/services/string-attribute.service';
import { PermissionAttributeService } from '../../common/services/permission-attribute.service';
import { TestDbModule } from '../../tests/test-db.module';
import { ExceptionModule } from '../../exception/exception.module';
import { CommonModule } from '../../common/common.module';

describe('DirectoryController', () => {

  let app: INestApplication;
  let dataSource: DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TestDbModule,
        ExceptionModule,
        CommonModule,
        TypeOrmModule.forFeature([Directory]),
      ],
      controllers: [DirectoryController],
      providers: [],
    }).compile();

    app = module.createNestApplication();
    dataSource = module.get<DataSource>(DataSource);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /directory', () => {
    it('should return an empty array when no directories exist', async () => {
      const response = await request(app.getHttpServer())
        .get('/directory')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return an array of directories with relations', async () => {
      const repo = dataSource.getRepository(Directory);
      await repo.save(repo.create({ id: 'dir-1' }));

      const response = await request(app.getHttpServer())
        .get('/directory')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].id).toBe('dir-1');
      expect(response.body[0].attributes).toEqual({
        strings: [],
        points: [],
      });
      expect(response.body[0].permissions).toEqual([]);
    });
  });

  describe('GET /directory with pagination', () => {
    it('should return limited directories when limit is provided', async () => {
      await dataSource.getRepository(Directory).save({ id: 'dir-1' });
      await dataSource.getRepository(Directory).save({ id: 'dir-2' });
      await dataSource.getRepository(Directory).save({ id: 'dir-3' });

      const response = await request(app.getHttpServer())
        .get('/directory?limit=2')
        .expect(200);

      expect(response.body).toHaveLength(2);
    });

    it('should skip directories when offset is provided', async () => {
      await dataSource.getRepository(Directory).save({ id: 'dir-1' });
      await dataSource.getRepository(Directory).save({ id: 'dir-2' });
      await dataSource.getRepository(Directory).save({ id: 'dir-3' });

      const response = await request(app.getHttpServer())
        .get('/directory?offset=1')
        .expect(200);

      expect(response.body).toHaveLength(2);
    });

    it('should return paginated directories when both limit and offset are provided', async () => {
      await dataSource.getRepository(Directory).save({ id: 'dir-1' });
      await dataSource.getRepository(Directory).save({ id: 'dir-2' });
      await dataSource.getRepository(Directory).save({ id: 'dir-3' });
      await dataSource.getRepository(Directory).save({ id: 'dir-4' });

      const response = await request(app.getHttpServer())
        .get('/directory?limit=2&offset=1')
        .expect(200);

      expect(response.body).toHaveLength(2);
    });

    it('should return empty array when offset exceeds total directories', async () => {
      await dataSource.getRepository(Directory).save({ id: 'dir-1' });

      const response = await request(app.getHttpServer())
        .get('/directory?offset=10')
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });

  describe('GET /directory/:id', () => {
    it('should return 404 for non-existent directory', async () => {
      const response = await request(app.getHttpServer())
        .get('/directory/non-existent-id')
        .expect(404);

      expect(response.body.message).toBe('Directory with id non-existent-id not found');
      expect(response.body.details).toEqual({
        entity: 'Directory',
        id: 'non-existent-id',
      });
    });

    it('should return a single directory with relations', async () => {
      const repo = dataSource.getRepository(Directory);
      await repo.save(repo.create({ id: 'dir-1' }));

      const response = await request(app.getHttpServer())
        .get('/directory/dir-1')
        .expect(200);

      expect(response.body.id).toBe('dir-1');
      expect(response.body.attributes).toEqual({
        strings: [],
        points: [],
      });
      expect(response.body.permissions).toEqual([]);
    });
  });

  describe('POST /directory', () => {
    it('should create and return a new directory', async () => {
      const response = await request(app.getHttpServer())
        .post('/directory')
        .send({ id: 'new-dir' })
        .expect(201);

      expect(response.body.id).toBe('new-dir');
      expect(response.body.attributes).toEqual({
        strings: [],
        points: [],
      });

      const repo = dataSource.getRepository(Directory);
      const found = await repo.findOne({ where: { id: 'new-dir' } });
      expect(found).not.toBeNull();
    });

    it('should create directory with strings', async () => {
      const attrRepo = dataSource.getRepository(Attribute);
      await attrRepo.save(attrRepo.create({ id: 'name' }));

      const response = await request(app.getHttpServer())
        .post('/directory')
        .send({
          id: 'new-dir',
          strings: [{ parentId: 'new-dir', attributeId: 'name', value: 'Test Directory' }],
        })
        .expect(201);

      expect(response.body.id).toBe('new-dir');
      expect(response.body.attributes.strings).toHaveLength(1);
      expect(response.body.attributes.strings[0]).toEqual({
        lang: null,
        attr: 'name',
        value: 'Test Directory',
      });
    });
  });

  describe('PUT /directory/:id', () => {
    it('should return 404 for non-existent directory', async () => {
      const response = await request(app.getHttpServer())
        .put('/directory/non-existent-id')
        .send({})
        .expect(404);

      expect(response.body.message).toBe('Directory with id non-existent-id not found');
      expect(response.body.details).toEqual({
        entity: 'Directory',
        id: 'non-existent-id',
      });
    });

    it('should update and return the directory', async () => {
      const repo = dataSource.getRepository(Directory);
      await repo.save(repo.create({ id: 'dir-1' }));

      const response = await request(app.getHttpServer())
        .put('/directory/dir-1')
        .send({})
        .expect(200);

      expect(response.body.id).toBe('dir-1');
    });
  });

  describe('DELETE /directory/:id', () => {
    it('should return 404 for non-existent directory', async () => {
      const response = await request(app.getHttpServer())
        .delete('/directory/non-existent-id')
        .expect(404);

      expect(response.body.message).toBe('Directory with id non-existent-id not found');
      expect(response.body.details).toEqual({
        entity: 'Directory',
        id: 'non-existent-id',
      });
    });

    it('should delete the directory', async () => {
      const repo = dataSource.getRepository(Directory);
      await repo.save(repo.create({ id: 'dir-1' }));

      await request(app.getHttpServer())
        .delete('/directory/dir-1')
        .expect(200);

      const found = await repo.findOne({ where: { id: 'dir-1' } });
      expect(found).toBeNull();
    });
  });

});
