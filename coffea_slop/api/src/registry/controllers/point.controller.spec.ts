import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource, EntityTarget, Repository } from 'typeorm';
import * as request from 'supertest';
import { PointController } from './point.controller';
import { Point } from '../entities/point/point.entity';
import { Directory } from '../entities/directory/directory.entity';
import { Attribute } from '../../settings/entities/attribute/attribute.entity';
import { TestDbModule } from '../../tests/test-db.module';
import { ExceptionModule } from '../../exception/exception.module';
import { CommonModule } from '../../common/common.module';
import { Directory4Permission } from '../entities/directory/directory4permission.entity';
import { PermissionMethod } from '../../common/permission/permission.method';

describe('PointController', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let repo: <T>(target: EntityTarget<T>) => Repository<T>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TestDbModule,
        ExceptionModule,
        CommonModule,
        TypeOrmModule.forFeature([Point]),
      ],
      controllers: [PointController],
      providers: [],
    }).compile();

    app = module.createNestApplication();
    dataSource = module.get<DataSource>(DataSource);
    await app.init();

    repo = dataSource.getRepository.bind(dataSource);
  });

  afterEach(() => app.close());

  describe('GET /point', () => {
    it('should return an empty array when no points exist', async () => {
      const response = await request(app.getHttpServer())
        .get('/point')
        .expect(200);

      expect(response.body).toEqual({ data: [], count: 0 });
    });

    it('should return an array of points with relations', async () => {
      await repo(Directory).save({ id: 'dir-1' });
      await repo(Directory4Permission).save({ parentId: 'dir-1', method: PermissionMethod.ALL });
      await repo(Point).save({ id: 'point-1', directoryId: 'dir-1' });

      const response = await request(app.getHttpServer())
        .get('/point')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].id).toBe('point-1');
      expect(response.body.data[0].directoryId).toBe('dir-1');
      expect(response.body.data[0].attributes).toEqual({
        strings: [],
        points: [],
      });
    });
  });

  describe('GET /point with pagination', () => {
    it('should return limited points when limit is provided', async () => {
      await repo(Directory).save({ id: 'dir-1' });
      await repo(Directory4Permission).save({ parentId: 'dir-1', method: PermissionMethod.ALL });
      await repo(Point).save({ id: 'point-1', directoryId: 'dir-1' });
      await repo(Point).save({ id: 'point-2', directoryId: 'dir-1' });
      await repo(Point).save({ id: 'point-3', directoryId: 'dir-1' });

      const response = await request(app.getHttpServer())
        .get('/point?limit=2')
        .expect(200);

      expect(response.body.data).toHaveLength(2);
    });

    it('should skip points when offset is provided', async () => {
      await repo(Directory).save({ id: 'dir-1' });
      await repo(Directory4Permission).save({ parentId: 'dir-1', method: PermissionMethod.ALL });
      await repo(Point).save({ id: 'point-1', directoryId: 'dir-1' });
      await repo(Point).save({ id: 'point-2', directoryId: 'dir-1' });
      await repo(Point).save({ id: 'point-3', directoryId: 'dir-1' });

      const response = await request(app.getHttpServer())
        .get('/point?offset=1')
        .expect(200);

      expect(response.body.data).toHaveLength(2);
    });

    it('should return paginated points when both limit and offset are provided', async () => {
      await repo(Directory).save({ id: 'dir-1' });
      await repo(Directory4Permission).save({ parentId: 'dir-1', method: PermissionMethod.ALL });
      await repo(Point).save({ id: 'point-1', directoryId: 'dir-1' });
      await repo(Point).save({ id: 'point-2', directoryId: 'dir-1' });
      await repo(Point).save({ id: 'point-3', directoryId: 'dir-1' });
      await repo(Point).save({ id: 'point-4', directoryId: 'dir-1' });

      const response = await request(app.getHttpServer())
        .get('/point?limit=2&offset=1')
        .expect(200);

      expect(response.body.data).toHaveLength(2);
    });

    it('should return empty array when offset exceeds total points', async () => {
      await repo(Directory).save({ id: 'dir-1' });
      await repo(Point).save({ id: 'point-1', directoryId: 'dir-1' });

      const response = await request(app.getHttpServer())
        .get('/point?offset=10')
        .expect(200);

      expect(response.body.data).toEqual([]);
    });
  });

  describe('GET /point/:id', () => {
    it('should return 404 for non-existent point', async () => {
      const response = await request(app.getHttpServer())
        .get('/point/non-existent-id')
        .expect(404);

      expect(response.body.message).toBe(
        'Point with id non-existent-id not found',
      );
      expect(response.body.details).toEqual({
        entity: 'Point',
        id: 'non-existent-id',
      });
    });

    it('should return a single point with relations', async () => {
      await repo(Directory).save({ id: 'dir-1' });
      await repo(Point).save({ id: 'point-1', directoryId: 'dir-1' });

      const response = await request(app.getHttpServer())
        .get('/point/point-1')
        .expect(200);

      expect(response.body.id).toBe('point-1');
      expect(response.body.directoryId).toBe('dir-1');
      expect(response.body.attributes).toEqual({
        strings: [],
        points: [],
      });
    });
  });

  describe('POST /point', () => {
    it('should create and return a new point', async () => {
      await repo(Directory).save({ id: 'dir-1' });

      const response = await request(app.getHttpServer())
        .post('/point')
        .send({ id: 'new-point', directoryId: 'dir-1' })
        .expect(201);

      expect(response.body.id).toBe('new-point');
      expect(response.body.directoryId).toBe('dir-1');
      expect(response.body.attributes).toEqual({
        strings: [],
        points: [],
      });

      const found = await repo(Point).findOne({ where: { id: 'new-point' } });
      expect(found).not.toBeNull();
    });

    it('should create point with strings', async () => {
      await repo(Directory).save({ id: 'dir-1' });
      await repo(Attribute).save({ id: 'name' });

      const response = await request(app.getHttpServer())
        .post('/point')
        .send({
          id: 'new-point',
          directoryId: 'dir-1',
          strings: [{ attr: 'name', value: 'Test Point' }],
        })
        .expect(201);

      expect(response.body.id).toBe('new-point');
      expect(response.body.attributes.strings).toHaveLength(1);
      expect(response.body.attributes.strings[0]).toEqual({
        lang: null,
        attr: 'name',
        value: 'Test Point',
      });
    });

    it('should return 400 when id is empty string', async () => {
      await repo(Directory).save({ id: 'dir-1' });

      const response = await request(app.getHttpServer())
        .post('/point')
        .send({ id: '', directoryId: 'dir-1' })
        .expect(400);

      expect(response.body.message).toBe('Database query failed');
    });
  });

  describe('PUT /point/:id', () => {
    it('should return 404 for non-existent point', async () => {
      const response = await request(app.getHttpServer())
        .put('/point/non-existent-id')
        .send({ directoryId: 'dir-1' })
        .expect(404);

      expect(response.body.message).toBe(
        'Point with id non-existent-id not found',
      );
      expect(response.body.details).toEqual({
        entity: 'Point',
        id: 'non-existent-id',
      });
    });

    it('should update and return the point', async () => {
      await repo(Directory).save({ id: 'dir-1' });
      await repo(Directory).save({ id: 'dir-2' });
      await repo(Point).save({ id: 'point-1', directoryId: 'dir-1' });

      const response = await request(app.getHttpServer())
        .put('/point/point-1')
        .send({ directoryId: 'dir-2' })
        .expect(200);

      expect(response.body.id).toBe('point-1');
      expect(response.body.directoryId).toBe('dir-2');
    });
  });

  describe('DELETE /point/:id', () => {
    it('should return 404 for non-existent point', async () => {
      const response = await request(app.getHttpServer())
        .delete('/point/non-existent-id')
        .expect(404);

      expect(response.body.message).toBe(
        'Point with id non-existent-id not found',
      );
      expect(response.body.details).toEqual({
        entity: 'Point',
        id: 'non-existent-id',
      });
    });

    it('should delete the point', async () => {
      await repo(Directory).save({ id: 'dir-1' });
      await repo(Point).save({ id: 'point-1', directoryId: 'dir-1' });

      await request(app.getHttpServer()).delete('/point/point-1').expect(204);

      const found = await repo(Point).findOne({ where: { id: 'point-1' } });
      expect(found).toBeNull();
    });
  });
});
