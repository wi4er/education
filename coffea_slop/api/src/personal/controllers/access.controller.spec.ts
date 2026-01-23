import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource, Repository, EntityTarget } from 'typeorm';
import * as request from 'supertest';
import { AccessController } from './access.controller';
import { Access } from '../entities/access/access.entity';
import { Group } from '../entities/group/group.entity';
import { AccessEntity } from '../../common/access/access-entity.enum';
import { AccessMethod } from '../entities/access/access-method.enum';
import { TestDbModule } from '../../tests/test-db.module';
import { ExceptionModule } from '../../exception/exception.module';
import { CommonModule } from '../../common/common.module';

describe('AccessController', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let repo: <T>(target: EntityTarget<T>) => Repository<T>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TestDbModule,
        ExceptionModule,
        CommonModule,
        TypeOrmModule.forFeature([Access]),
      ],
      controllers: [AccessController],
    }).compile();

    app = module.createNestApplication();
    dataSource = module.get<DataSource>(DataSource);
    await app.init();

    repo = dataSource.getRepository.bind(dataSource);
  });

  afterEach(() => app.close());

  describe('GET /access', () => {
    it('should return an empty array when no access entries exist', async () => {
      const response = await request(app.getHttpServer())
        .get('/access')
        .expect(200);

      expect(response.body).toEqual({ data: [], count: 0 });
    });

    it('should return an array of access entries', async () => {
      await repo(Group).save({ id: 'admins' });
      await repo(Access).save({
        groupId: 'admins',
        entity: AccessEntity.USER,
        method: AccessMethod.GET,
      });

      const response = await request(app.getHttpServer())
        .get('/access')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].group).toBe('admins');
      expect(response.body.data[0].entity).toBe(AccessEntity.USER);
      expect(response.body.data[0].method).toBe(AccessMethod.GET);
    });
  });

  describe('GET /access/:id', () => {
    it('should return 404 for non-existent access', async () => {
      const response = await request(app.getHttpServer())
        .get('/access/999999')
        .expect(404);

      expect(response.body.message).toBe('Access with id 999999 not found');
      expect(response.body.details).toEqual({
        entity: 'Access',
        id: '999999',
      });
    });

    it('should return a single access entry', async () => {
      await repo(Group).save({ id: 'admins' });
      const saved = await repo(Access).save({
        groupId: 'admins',
        entity: AccessEntity.USER,
        method: AccessMethod.GET,
      });

      const response = await request(app.getHttpServer())
        .get(`/access/${saved.id}`)
        .expect(200);

      expect(response.body.id).toBe(saved.id);
      expect(response.body.group).toBe('admins');
      expect(response.body.entity).toBe(AccessEntity.USER);
      expect(response.body.method).toBe(AccessMethod.GET);
    });
  });

  describe('POST /access', () => {
    it('should create and return a new access entry', async () => {
      await repo(Group).save({ id: 'admins' });

      const response = await request(app.getHttpServer())
        .post('/access')
        .send({
          groupId: 'admins',
          entity: AccessEntity.USER,
          method: AccessMethod.POST,
        })
        .expect(201);

      expect(response.body.group).toBe('admins');
      expect(response.body.entity).toBe(AccessEntity.USER);
      expect(response.body.method).toBe(AccessMethod.POST);

      const found = await repo(Access).findOne({ where: { id: response.body.id } });
      expect(found).not.toBeNull();
    });
  });

  describe('PUT /access/:id', () => {
    it('should return 404 for non-existent access', async () => {
      const response = await request(app.getHttpServer())
        .put('/access/999999')
        .send({
          groupId: 'admins',
          entity: AccessEntity.USER,
          method: AccessMethod.GET,
        })
        .expect(404);

      expect(response.body.message).toBe('Access with id 999999 not found');
      expect(response.body.details).toEqual({
        entity: 'Access',
        id: '999999',
      });
    });

    it('should update and return the access entry', async () => {
      await repo(Group).save({ id: 'admins' });
      await repo(Group).save({ id: 'editors' });
      const saved = await repo(Access).save({
        groupId: 'admins',
        entity: AccessEntity.USER,
        method: AccessMethod.GET,
      });

      const response = await request(app.getHttpServer())
        .put(`/access/${saved.id}`)
        .send({
          groupId: 'editors',
          entity: AccessEntity.GROUP,
          method: AccessMethod.PUT,
        })
        .expect(200);

      expect(response.body.id).toBe(saved.id);
      expect(response.body.group).toBe('editors');
      expect(response.body.entity).toBe(AccessEntity.GROUP);
      expect(response.body.method).toBe(AccessMethod.PUT);
    });
  });

  describe('DELETE /access/:id', () => {
    it('should return 404 for non-existent access', async () => {
      const response = await request(app.getHttpServer())
        .delete('/access/999999')
        .expect(404);

      expect(response.body.message).toBe('Access with id 999999 not found');
      expect(response.body.details).toEqual({
        entity: 'Access',
        id: '999999',
      });
    });

    it('should delete the access entry', async () => {
      await repo(Group).save({ id: 'admins' });
      const saved = await repo(Access).save({
        groupId: 'admins',
        entity: AccessEntity.USER,
        method: AccessMethod.GET,
      });

      await request(app.getHttpServer())
        .delete(`/access/${saved.id}`)
        .expect(200);

      const found = await repo(Access).findOne({ where: { id: saved.id } });
      expect(found).toBeNull();
    });
  });
});
