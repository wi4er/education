import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import * as request from 'supertest';
import { UserController } from './user.controller';
import { User } from '../entities/user/user.entity';
import { Attribute } from '../../settings/entities/attribute/attribute.entity';
import { PointAttributeService } from '../../common/services/point-attribute.service';
import { StringAttributeService } from '../../common/services/string-attribute.service';
import { DescriptionAttributeService } from '../../common/services/description-attribute.service';
import { TestDbModule } from '../../tests/test-db.module';
import { ExceptionModule } from '../../exception/exception.module';
import { CommonModule } from '../../common/common.module';

describe('UserController', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TestDbModule,
        ExceptionModule,
        CommonModule,
        TypeOrmModule.forFeature([User]),
      ],
      controllers: [UserController],
      providers: [],
    }).compile();

    app = module.createNestApplication();
    dataSource = module.get<DataSource>(DataSource);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /user', () => {
    it('should return an empty array when no users exist', async () => {
      const response = await request(app.getHttpServer())
        .get('/user')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return an array of users with relations', async () => {
      const repo = dataSource.getRepository(User);
      await repo.save(repo.create({ id: 'user-1' }));

      const response = await request(app.getHttpServer())
        .get('/user')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].id).toBe('user-1');
      expect(response.body[0].attributes).toEqual({
        strings: [],
        points: [],
        descriptions: [],
        counters: [],
      });
    });
  });

  describe('GET /user with pagination', () => {
    it('should return limited users when limit is provided', async () => {
      await dataSource.getRepository(User).save({ id: 'user-1' });
      await dataSource.getRepository(User).save({ id: 'user-2' });
      await dataSource.getRepository(User).save({ id: 'user-3' });

      const response = await request(app.getHttpServer())
        .get('/user?limit=2')
        .expect(200);

      expect(response.body).toHaveLength(2);
    });

    it('should skip users when offset is provided', async () => {
      await dataSource.getRepository(User).save({ id: 'user-1' });
      await dataSource.getRepository(User).save({ id: 'user-2' });
      await dataSource.getRepository(User).save({ id: 'user-3' });

      const response = await request(app.getHttpServer())
        .get('/user?offset=1')
        .expect(200);

      expect(response.body).toHaveLength(2);
    });

    it('should return paginated users when both limit and offset are provided', async () => {
      await dataSource.getRepository(User).save({ id: 'user-1' });
      await dataSource.getRepository(User).save({ id: 'user-2' });
      await dataSource.getRepository(User).save({ id: 'user-3' });
      await dataSource.getRepository(User).save({ id: 'user-4' });

      const response = await request(app.getHttpServer())
        .get('/user?limit=2&offset=1')
        .expect(200);

      expect(response.body).toHaveLength(2);
    });

    it('should return empty array when offset exceeds total users', async () => {
      await dataSource.getRepository(User).save({ id: 'user-1' });

      const response = await request(app.getHttpServer())
        .get('/user?offset=10')
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });

  describe('GET /user/:id', () => {
    it('should return 404 for non-existent user', async () => {
      const response = await request(app.getHttpServer())
        .get('/user/non-existent-id')
        .expect(404);

      expect(response.body.message).toBe(
        'User with id non-existent-id not found',
      );
      expect(response.body.details).toEqual({
        entity: 'User',
        id: 'non-existent-id',
      });
    });

    it('should return a single user with relations', async () => {
      const repo = dataSource.getRepository(User);
      await repo.save(repo.create({ id: 'user-1' }));

      const response = await request(app.getHttpServer())
        .get('/user/user-1')
        .expect(200);

      expect(response.body.id).toBe('user-1');
      expect(response.body.attributes).toEqual({
        strings: [],
        points: [],
        descriptions: [],
        counters: [],
      });
    });
  });

  describe('POST /user', () => {
    it('should create and return a new user', async () => {
      const response = await request(app.getHttpServer())
        .post('/user')
        .send({ id: 'new-user' })
        .expect(201);

      expect(response.body.id).toBe('new-user');
      expect(response.body.attributes).toEqual({
        strings: [],
        points: [],
        descriptions: [],
        counters: [],
      });

      const repo = dataSource.getRepository(User);
      const found = await repo.findOne({ where: { id: 'new-user' } });
      expect(found).not.toBeNull();
    });

    it('should create user with strings', async () => {
      const attrRepo = dataSource.getRepository(Attribute);
      await attrRepo.save(attrRepo.create({ id: 'name' }));

      const response = await request(app.getHttpServer())
        .post('/user')
        .send({
          id: 'new-user',
          strings: [{ attr: 'name', value: 'John Doe' }],
        })
        .expect(201);

      expect(response.body.id).toBe('new-user');
      expect(response.body.attributes.strings).toHaveLength(1);
      expect(response.body.attributes.strings[0]).toEqual({
        lang: null,
        attr: 'name',
        value: 'John Doe',
      });
    });

    it('should create user with descriptions', async () => {
      const attrRepo = dataSource.getRepository(Attribute);
      await attrRepo.save(attrRepo.create({ id: 'bio' }));

      const response = await request(app.getHttpServer())
        .post('/user')
        .send({
          id: 'new-user',
          descriptions: [{ attr: 'bio', value: 'User biography text' }],
        })
        .expect(201);

      expect(response.body.id).toBe('new-user');
      expect(response.body.attributes.descriptions).toHaveLength(1);
      expect(response.body.attributes.descriptions[0]).toEqual({
        lang: null,
        attr: 'bio',
        value: 'User biography text',
      });
    });
  });

  describe('PUT /user/:id', () => {
    it('should return 404 for non-existent user', async () => {
      const response = await request(app.getHttpServer())
        .put('/user/non-existent-id')
        .send({})
        .expect(404);

      expect(response.body.message).toBe(
        'User with id non-existent-id not found',
      );
      expect(response.body.details).toEqual({
        entity: 'User',
        id: 'non-existent-id',
      });
    });

    it('should update and return the user', async () => {
      const repo = dataSource.getRepository(User);
      await repo.save(repo.create({ id: 'user-1' }));

      const response = await request(app.getHttpServer())
        .put('/user/user-1')
        .send({})
        .expect(200);

      expect(response.body.id).toBe('user-1');
    });
  });

  describe('DELETE /user/:id', () => {
    it('should return 404 for non-existent user', async () => {
      const response = await request(app.getHttpServer())
        .delete('/user/non-existent-id')
        .expect(404);

      expect(response.body.message).toBe(
        'User with id non-existent-id not found',
      );
      expect(response.body.details).toEqual({
        entity: 'User',
        id: 'non-existent-id',
      });
    });

    it('should delete the user', async () => {
      const repo = dataSource.getRepository(User);
      await repo.save(repo.create({ id: 'user-1' }));

      await request(app.getHttpServer()).delete('/user/user-1').expect(200);

      const found = await repo.findOne({ where: { id: 'user-1' } });
      expect(found).toBeNull();
    });
  });
});
