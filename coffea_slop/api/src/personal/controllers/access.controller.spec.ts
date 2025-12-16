import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import * as request from 'supertest';
import { AccessController } from './access.controller';
import { Access } from '../entities/access/access.entity';
import { Group } from '../entities/group/group.entity';
import { AccessEntity } from '../../common/access/access-entity.enum';
import { AccessMethod } from '../entities/access/access-method.enum';
import { TestDbModule } from '../../tests/test-db.module';
import { ExceptionModule } from '../../exception/exception.module';

describe('AccessController', () => {

  let app: INestApplication;
  let dataSource: DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TestDbModule,
        ExceptionModule,
        TypeOrmModule.forFeature([Access]),
      ],
      controllers: [AccessController],
    }).compile();

    app = module.createNestApplication();
    dataSource = module.get<DataSource>(DataSource);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /access', () => {
    it('should return an empty array when no access entries exist', async () => {
      const response = await request(app.getHttpServer())
        .get('/access')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return an array of access entries', async () => {
      const groupRepo = dataSource.getRepository(Group);
      await groupRepo.save(groupRepo.create({ id: 'admins' }));

      const repo = dataSource.getRepository(Access);
      await repo.save(repo.create({
        groupId: 'admins',
        entity: AccessEntity.USER,
        method: AccessMethod.GET,
      }));

      const response = await request(app.getHttpServer())
        .get('/access')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].group).toBe('admins');
      expect(response.body[0].entity).toBe(AccessEntity.USER);
      expect(response.body[0].method).toBe(AccessMethod.GET);
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
      const groupRepo = dataSource.getRepository(Group);
      await groupRepo.save(groupRepo.create({ id: 'admins' }));

      const repo = dataSource.getRepository(Access);
      const saved = await repo.save(repo.create({
        groupId: 'admins',
        entity: AccessEntity.USER,
        method: AccessMethod.GET,
      }));

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
      const groupRepo = dataSource.getRepository(Group);
      await groupRepo.save(groupRepo.create({ id: 'admins' }));

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

      const repo = dataSource.getRepository(Access);
      const found = await repo.findOne({ where: { id: response.body.id } });
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
      const groupRepo = dataSource.getRepository(Group);
      await groupRepo.save(groupRepo.create({ id: 'admins' }));
      await groupRepo.save(groupRepo.create({ id: 'editors' }));

      const repo = dataSource.getRepository(Access);
      const saved = await repo.save(repo.create({
        groupId: 'admins',
        entity: AccessEntity.USER,
        method: AccessMethod.GET,
      }));

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
      const groupRepo = dataSource.getRepository(Group);
      await groupRepo.save(groupRepo.create({ id: 'admins' }));

      const repo = dataSource.getRepository(Access);
      const saved = await repo.save(repo.create({
        groupId: 'admins',
        entity: AccessEntity.USER,
        method: AccessMethod.GET,
      }));

      await request(app.getHttpServer())
        .delete(`/access/${saved.id}`)
        .expect(200);

      const found = await repo.findOne({ where: { id: saved.id } });
      expect(found).toBeNull();
    });
  });

});
