import {Test, TestingModule} from '@nestjs/testing';
import {INestApplication} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {DataSource} from 'typeorm';
import * as request from 'supertest';
import {GroupController} from './group.controller';
import {Group} from '../entities/group/group.entity';
import {Attribute} from '../../settings/entities/attribute/attribute.entity';
import {TestDbModule} from '../../tests/test-db.module';
import {ExceptionModule} from '../../exception/exception.module';
import {CommonModule} from '../../common/common.module';

describe('GroupController', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let repo;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TestDbModule,
        ExceptionModule,
        CommonModule,
        TypeOrmModule.forFeature([Group]),
      ],
      controllers: [GroupController],
      providers: [],
    }).compile();

    app = module.createNestApplication();
    dataSource = module.get<DataSource>(DataSource);
    await app.init();

    repo = dataSource.getRepository.bind(dataSource);
  });

  afterEach(() => app.close());

  describe('GET /group', () => {
    it('should return an empty array when no groups exist', async () => {
      const response = await request(app.getHttpServer())
        .get('/group')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return an array of groups with relations', async () => {
      await repo(Group).save({ id: 'group-1' });

      const response = await request(app.getHttpServer())
        .get('/group')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].id).toBe('group-1');
      expect(response.body[0].attributes).toEqual({
        strings: [],
        points: [],
        descriptions: [],
      });
    });
  });

  describe('GET /group with pagination', () => {
    it('should return limited groups when limit is provided', async () => {
      await repo(Group).save({ id: 'group-1' });
      await repo(Group).save({ id: 'group-2' });
      await repo(Group).save({ id: 'group-3' });

      const response = await request(app.getHttpServer())
        .get('/group?limit=2')
        .expect(200);

      expect(response.body).toHaveLength(2);
    });

    it('should skip groups when offset is provided', async () => {
      await repo(Group).save({ id: 'group-1' });
      await repo(Group).save({ id: 'group-2' });
      await repo(Group).save({ id: 'group-3' });

      const response = await request(app.getHttpServer())
        .get('/group?offset=1')
        .expect(200);

      expect(response.body).toHaveLength(2);
    });

    it('should return paginated groups when both limit and offset are provided', async () => {
      await repo(Group).save({ id: 'group-1' });
      await repo(Group).save({ id: 'group-2' });
      await repo(Group).save({ id: 'group-3' });
      await repo(Group).save({ id: 'group-4' });

      const response = await request(app.getHttpServer())
        .get('/group?limit=2&offset=1')
        .expect(200);

      expect(response.body).toHaveLength(2);
    });

    it('should return empty array when offset exceeds total groups', async () => {
      await repo(Group).save({ id: 'group-1' });

      const response = await request(app.getHttpServer())
        .get('/group?offset=10')
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });

  describe('GET /group/:id', () => {
    it('should return 404 for non-existent group', async () => {
      const response = await request(app.getHttpServer())
        .get('/group/non-existent-id')
        .expect(404);

      expect(response.body.message).toBe(
        'Group with id non-existent-id not found',
      );
      expect(response.body.details).toEqual({
        entity: 'Group',
        id: 'non-existent-id',
      });
    });

    it('should return a single group with relations', async () => {
      await repo(Group).save({ id: 'group-1' });

      const response = await request(app.getHttpServer())
        .get('/group/group-1')
        .expect(200);

      expect(response.body.id).toBe('group-1');
      expect(response.body.attributes).toEqual({
        strings: [],
        points: [],
        descriptions: [],
      });
    });
  });

  describe('POST /group', () => {
    it('should create and return a new group', async () => {
      const response = await request(app.getHttpServer())
        .post('/group')
        .send({ id: 'new-group' })
        .expect(201);

      expect(response.body.id).toBe('new-group');
      expect(response.body.attributes).toEqual({
        strings: [],
        points: [],
        descriptions: [],
      });

      const found = await repo(Group).findOne({ where: { id: 'new-group' } });
      expect(found).not.toBeNull();
    });

    it('should create group with strings', async () => {
      await repo(Attribute).save({ id: 'name' });

      const response = await request(app.getHttpServer())
        .post('/group')
        .send({
          id: 'new-group',
          strings: [{ attr: 'name', value: 'Administrators' }],
        })
        .expect(201);

      expect(response.body.id).toBe('new-group');
      expect(response.body.attributes.strings).toHaveLength(1);
      expect(response.body.attributes.strings[0]).toEqual({
        lang: null,
        attr: 'name',
        value: 'Administrators',
      });
    });

    it('should create group with descriptions', async () => {
      await repo(Attribute).save({ id: 'description' });

      const response = await request(app.getHttpServer())
        .post('/group')
        .send({
          id: 'new-group',
          descriptions: [
            { attr: 'description', value: 'Group with full access' },
          ],
        })
        .expect(201);

      expect(response.body.id).toBe('new-group');
      expect(response.body.attributes.descriptions).toHaveLength(1);
      expect(response.body.attributes.descriptions[0]).toEqual({
        lang: null,
        attr: 'description',
        value: 'Group with full access',
      });
    });
  });

  describe('PUT /group/:id', () => {
    it('should return 404 for non-existent group', async () => {
      const response = await request(app.getHttpServer())
        .put('/group/non-existent-id')
        .send({})
        .expect(404);

      expect(response.body.message).toBe(
        'Group with id non-existent-id not found',
      );
      expect(response.body.details).toEqual({
        entity: 'Group',
        id: 'non-existent-id',
      });
    });

    it('should update and return the group', async () => {
      await repo(Group).save({ id: 'group-1' });

      const response = await request(app.getHttpServer())
        .put('/group/group-1')
        .send({})
        .expect(200);

      expect(response.body.id).toBe('group-1');
    });
  });

  describe('DELETE /group/:id', () => {
    it('should return 404 for non-existent group', async () => {
      const response = await request(app.getHttpServer())
        .delete('/group/non-existent-id')
        .expect(404);

      expect(response.body.message).toBe(
        'Group with id non-existent-id not found',
      );
      expect(response.body.details).toEqual({
        entity: 'Group',
        id: 'non-existent-id',
      });
    });

    it('should delete the group', async () => {
      await repo(Group).save({ id: 'group-1' });

      await request(app.getHttpServer()).delete('/group/group-1').expect(200);

      const found = await repo(Group).findOne({ where: { id: 'group-1' } });
      expect(found).toBeNull();
    });
  });
});
