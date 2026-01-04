import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import * as request from 'supertest';
import { StatusController } from './status.controller';
import { Status } from '../entities/status/status.entity';
import { Status2String } from '../entities/status/status2string.entity';
import { Status2Point } from '../entities/status/status2point.entity';
import { TestDbModule } from '../../tests/test-db.module';
import { ExceptionModule } from '../../exception/exception.module';
import { CommonModule } from '../../common/common.module';

describe('StatusController', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let repo;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TestDbModule,
        ExceptionModule,
        CommonModule,
        TypeOrmModule.forFeature([Status, Status2String, Status2Point]),
      ],
      controllers: [StatusController],
    }).compile();

    app = module.createNestApplication();
    dataSource = module.get<DataSource>(DataSource);
    await app.init();

    repo = dataSource.getRepository.bind(dataSource);
  });

  afterEach(() => app.close());

  describe('GET /status', () => {
    it('should return an empty array when no statuses exist', async () => {
      const response = await request(app.getHttpServer())
        .get('/status')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return an array of statuses with relations', async () => {
      await repo(Status).save({ id: 'status-1' });

      const response = await request(app.getHttpServer())
        .get('/status')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].id).toBe('status-1');
      expect(response.body[0].attributes).toEqual({
        strings: [],
        points: [],
      });
    });
  });

  describe('GET /status with pagination', () => {
    it('should return limited statuses when limit is provided', async () => {
      await repo(Status).save({ id: 'status-1' });
      await repo(Status).save({ id: 'status-2' });
      await repo(Status).save({ id: 'status-3' });

      const response = await request(app.getHttpServer())
        .get('/status?limit=2')
        .expect(200);

      expect(response.body).toHaveLength(2);
    });

    it('should skip statuses when offset is provided', async () => {
      await repo(Status).save({ id: 'status-1' });
      await repo(Status).save({ id: 'status-2' });
      await repo(Status).save({ id: 'status-3' });

      const response = await request(app.getHttpServer())
        .get('/status?offset=1')
        .expect(200);

      expect(response.body).toHaveLength(2);
    });

    it('should return paginated statuses when both limit and offset are provided', async () => {
      await repo(Status).save({ id: 'status-1' });
      await repo(Status).save({ id: 'status-2' });
      await repo(Status).save({ id: 'status-3' });
      await repo(Status).save({ id: 'status-4' });

      const response = await request(app.getHttpServer())
        .get('/status?limit=2&offset=1')
        .expect(200);

      expect(response.body).toHaveLength(2);
    });

    it('should return empty array when offset exceeds total statuses', async () => {
      await repo(Status).save({ id: 'status-1' });

      const response = await request(app.getHttpServer())
        .get('/status?offset=10')
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });

  describe('GET /status/:id', () => {
    it('should return 404 for non-existent status', async () => {
      const response = await request(app.getHttpServer())
        .get('/status/non-existent-id')
        .expect(404);

      expect(response.body.message).toBe(
        'Status with id non-existent-id not found',
      );
      expect(response.body.details).toEqual({
        entity: 'Status',
        id: 'non-existent-id',
      });
    });

    it('should return a single status with relations', async () => {
      await repo(Status).save({ id: 'status-1' });

      const response = await request(app.getHttpServer())
        .get('/status/status-1')
        .expect(200);

      expect(response.body.id).toBe('status-1');
      expect(response.body.attributes).toEqual({
        strings: [],
        points: [],
      });
    });
  });

  describe('POST /status', () => {
    it('should create and return a new status', async () => {
      const response = await request(app.getHttpServer())
        .post('/status')
        .send({ id: 'new-status' })
        .expect(201);

      expect(response.body.id).toBe('new-status');
      expect(response.body.attributes).toEqual({
        strings: [],
        points: [],
      });

      const found = await repo(Status).findOne({ where: { id: 'new-status' } });
      expect(found).not.toBeNull();
    });
  });

  describe('PUT /status/:id', () => {
    it('should return 404 for non-existent status', async () => {
      const response = await request(app.getHttpServer())
        .put('/status/non-existent-id')
        .send({})
        .expect(404);

      expect(response.body.message).toBe(
        'Status with id non-existent-id not found',
      );
      expect(response.body.details).toEqual({
        entity: 'Status',
        id: 'non-existent-id',
      });
    });

    it('should update and return the status', async () => {
      await repo(Status).save({ id: 'status-1' });

      const response = await request(app.getHttpServer())
        .put('/status/status-1')
        .send({})
        .expect(200);

      expect(response.body.id).toBe('status-1');
    });
  });

  describe('DELETE /status/:id', () => {
    it('should return 404 for non-existent status', async () => {
      const response = await request(app.getHttpServer())
        .delete('/status/non-existent-id')
        .expect(404);

      expect(response.body.message).toBe(
        'Status with id non-existent-id not found',
      );
      expect(response.body.details).toEqual({
        entity: 'Status',
        id: 'non-existent-id',
      });
    });

    it('should delete the status', async () => {
      await repo(Status).save({ id: 'status-1' });

      await request(app.getHttpServer()).delete('/status/status-1').expect(200);

      const found = await repo(Status).findOne({ where: { id: 'status-1' } });
      expect(found).toBeNull();
    });
  });
});
