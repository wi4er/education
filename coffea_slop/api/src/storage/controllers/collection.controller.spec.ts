import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { DataSource, Repository, EntityTarget } from 'typeorm';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';
import { CollectionController } from './collection.controller';
import { Collection } from '../entities/collection/collection.entity';
import { Attribute } from '../../settings/entities/attribute/attribute.entity';
import { Group } from '../../personal/entities/group/group.entity';
import { Collection4Permission } from '../entities/collection/collection4permission.entity';
import { TestDbModule } from '../../tests/test-db.module';
import { ExceptionModule } from '../../exception/exception.module';
import { CommonModule } from '../../common/common.module';
import { PermissionMethod } from '../../common/permission/permission.method';

const JWT_SECRET = 'test-secret';

describe('CollectionController', () => {
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
        TypeOrmModule.forFeature([Collection]),
        JwtModule.register({ secret: JWT_SECRET }),
      ],
      controllers: [CollectionController],
      providers: [],
    }).compile();

    app = module.createNestApplication();
    app.use(cookieParser());
    dataSource = module.get<DataSource>(DataSource);
    jwtService = module.get<JwtService>(JwtService);
    await app.init();

    repo = dataSource.getRepository.bind(dataSource);

    await repo(Group).save({ id: 'admin' });
  });

  afterEach(() => app.close());

  describe('GET /collection', () => {
    it('should return an empty array when no collections exist', async () => {
      const response = await request(app.getHttpServer())
        .get('/collection')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return an array of collections with relations', async () => {
      await repo(Collection).save({ id: 'col-1' });
      await repo(Collection4Permission).save({ parentId: 'col-1', method: PermissionMethod.READ });

      const response = await request(app.getHttpServer())
        .get('/collection')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].id).toBe('col-1');
      expect(response.body[0].attributes).toEqual({
        strings: [],
        points: [],
      });
      expect(response.body[0].permissions).toHaveLength(1);
      expect(response.body[0].status).toEqual([]);
    });

    it('should filter out collections without READ permission', async () => {
      await repo(Collection).save({ id: 'col-1' });
      await repo(Collection).save({ id: 'col-2' });
      await repo(Collection).save({ id: 'col-3' });
      await repo(Collection4Permission).save({ parentId: 'col-1', method: PermissionMethod.READ });
      await repo(Collection4Permission).save({ parentId: 'col-3', method: PermissionMethod.READ });

      const response = await request(app.getHttpServer())
        .get('/collection')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body.map(c => c.id)).toEqual(['col-1', 'col-3']);
    });
  });

  describe('GET /collection with pagination', () => {
    it('should return limited collections when limit is provided', async () => {
      await repo(Collection).save({ id: 'col-1' });
      await repo(Collection).save({ id: 'col-2' });
      await repo(Collection).save({ id: 'col-3' });
      await repo(Collection4Permission).save({ parentId: 'col-1', method: PermissionMethod.READ });
      await repo(Collection4Permission).save({ parentId: 'col-2', method: PermissionMethod.READ });
      await repo(Collection4Permission).save({ parentId: 'col-3', method: PermissionMethod.READ });

      const response = await request(app.getHttpServer())
        .get('/collection?limit=2')
        .expect(200);

      expect(response.body).toHaveLength(2);
    });

    it('should skip collections when offset is provided', async () => {
      await repo(Collection).save({ id: 'col-1' });
      await repo(Collection).save({ id: 'col-2' });
      await repo(Collection).save({ id: 'col-3' });
      await repo(Collection4Permission).save({ parentId: 'col-1', method: PermissionMethod.READ });
      await repo(Collection4Permission).save({ parentId: 'col-2', method: PermissionMethod.READ });
      await repo(Collection4Permission).save({ parentId: 'col-3', method: PermissionMethod.READ });

      const response = await request(app.getHttpServer())
        .get('/collection?offset=1')
        .expect(200);

      expect(response.body).toHaveLength(2);
    });

    it('should return paginated collections when both limit and offset are provided', async () => {
      await repo(Collection).save({ id: 'col-1' });
      await repo(Collection).save({ id: 'col-2' });
      await repo(Collection).save({ id: 'col-3' });
      await repo(Collection).save({ id: 'col-4' });
      await repo(Collection4Permission).save({ parentId: 'col-1', method: PermissionMethod.READ });
      await repo(Collection4Permission).save({ parentId: 'col-2', method: PermissionMethod.READ });
      await repo(Collection4Permission).save({ parentId: 'col-3', method: PermissionMethod.READ });
      await repo(Collection4Permission).save({ parentId: 'col-4', method: PermissionMethod.READ });

      const response = await request(app.getHttpServer())
        .get('/collection?limit=2&offset=1')
        .expect(200);

      expect(response.body).toHaveLength(2);
    });

    it('should return empty array when offset exceeds total collections', async () => {
      await repo(Collection).save({ id: 'col-1' });
      await repo(Collection4Permission).save({ parentId: 'col-1', method: PermissionMethod.READ });

      const response = await request(app.getHttpServer())
        .get('/collection?offset=10')
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });

  describe('GET /collection/:id', () => {
    it('should return 404 for non-existent collection', async () => {
      const response = await request(app.getHttpServer())
        .get('/collection/non-existent-id')
        .expect(404);

      expect(response.body.message).toBe(
        'Collection with id non-existent-id not found',
      );
      expect(response.body.details).toEqual({
        entity: 'Collection',
        id: 'non-existent-id',
      });
    });

    it('should return a single collection with relations', async () => {
      await repo(Collection).save({ id: 'col-1' });
      await repo(Collection4Permission).save({ parentId: 'col-1', method: PermissionMethod.READ });

      const response = await request(app.getHttpServer())
        .get('/collection/col-1')
        .expect(200);

      expect(response.body.id).toBe('col-1');
      expect(response.body.attributes).toEqual({
        strings: [],
        points: [],
      });
      expect(response.body.permissions).toHaveLength(1);
      expect(response.body.status).toEqual([]);
    });

    it('should return 403 when no READ permission exists', async () => {
      await repo(Collection).save({ id: 'col-1' });

      const response = await request(app.getHttpServer())
        .get('/collection/col-1')
        .expect(403);

      expect(response.body.message).toBe(
        'Permission denied: READ on Collection with id col-1',
      );
    });
  });

  describe('POST /collection', () => {
    it('should create and return a new collection', async () => {
      const response = await request(app.getHttpServer())
        .post('/collection')
        .send({ id: 'new-col' })
        .expect(201);

      expect(response.body.id).toBe('new-col');
      expect(response.body.attributes).toEqual({
        strings: [],
        points: [],
      });

      const found = await repo(Collection).findOne({ where: { id: 'new-col' } });
      expect(found).not.toBeNull();
    });

    it('should create collection with strings', async () => {
      await repo(Attribute).save({ id: 'name' });

      const response = await request(app.getHttpServer())
        .post('/collection')
        .send({
          id: 'new-col',
          strings: [{ attr: 'name', value: 'Test Collection' }],
        })
        .expect(201);

      expect(response.body.id).toBe('new-col');
      expect(response.body.attributes.strings).toHaveLength(1);
      expect(response.body.attributes.strings[0]).toEqual({
        lang: null,
        attr: 'name',
        value: 'Test Collection',
      });
    });

    it('should return 400 when id is empty string', async () => {
      const response = await request(app.getHttpServer())
        .post('/collection')
        .send({ id: '' })
        .expect(400);

      expect(response.body.message).toBe('Database query failed');
    });
  });

  describe('PUT /collection/:id', () => {
    it('should return 404 for non-existent collection', async () => {
      const response = await request(app.getHttpServer())
        .put('/collection/non-existent-id')
        .send({})
        .expect(404);

      expect(response.body.message).toBe(
        'Collection with id non-existent-id not found',
      );
      expect(response.body.details).toEqual({
        entity: 'Collection',
        id: 'non-existent-id',
      });
    });

    it('should update and return the collection', async () => {
      await repo(Collection).save({ id: 'col-1' });
      await repo(Collection4Permission).save({ parentId: 'col-1', method: PermissionMethod.WRITE });

      const response = await request(app.getHttpServer())
        .put('/collection/col-1')
        .send({})
        .expect(200);

      expect(response.body.id).toBe('col-1');
    });

    it('should return 403 when no WRITE permission exists', async () => {
      await repo(Collection).save({ id: 'col-1' });

      const response = await request(app.getHttpServer())
        .put('/collection/col-1')
        .send({})
        .expect(403);

      expect(response.body.message).toBe(
        'Permission denied: WRITE on Collection with id col-1',
      );
    });

    it('should update collection strings', async () => {
      await repo(Attribute).save({ id: 'name' });
      await repo(Collection).save({ id: 'col-1' });
      await repo(Collection4Permission).save({ parentId: 'col-1', method: PermissionMethod.WRITE });

      const response = await request(app.getHttpServer())
        .put('/collection/col-1')
        .send({
          strings: [{ attr: 'name', value: 'Updated Collection' }],
        })
        .expect(200);

      expect(response.body.attributes.strings).toHaveLength(1);
      expect(response.body.attributes.strings[0].value).toBe('Updated Collection');
    });
  });

  describe('DELETE /collection/:id', () => {
    it('should return 404 for non-existent collection', async () => {
      const response = await request(app.getHttpServer())
        .delete('/collection/non-existent-id')
        .expect(404);

      expect(response.body.message).toBe(
        'Collection with id non-existent-id not found',
      );
      expect(response.body.details).toEqual({
        entity: 'Collection',
        id: 'non-existent-id',
      });
    });

    it('should delete the collection', async () => {
      await repo(Collection).save({ id: 'col-1' });
      await repo(Collection4Permission).save({ parentId: 'col-1', method: PermissionMethod.DELETE });

      await request(app.getHttpServer())
        .delete('/collection/col-1')
        .expect(200);

      const found = await repo(Collection).findOne({ where: { id: 'col-1' } });
      expect(found).toBeNull();
    });

    it('should return 403 when no DELETE permission exists', async () => {
      await repo(Collection).save({ id: 'col-1' });

      const response = await request(app.getHttpServer())
        .delete('/collection/col-1')
        .expect(403);

      expect(response.body.message).toBe(
        'Permission denied: DELETE on Collection with id col-1',
      );
    });
  });
});
