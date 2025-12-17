import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import * as request from 'supertest';
import { BlockController } from './block.controller';
import { Block } from '../entities/block/block.entity';
import { Attribute } from '../../settings/entities/attribute/attribute.entity';
import { Group } from '../../personal/entities/group/group.entity';
import { TestDbModule } from '../../tests/test-db.module';
import { ExceptionModule } from '../../exception/exception.module';
import { CommonModule } from '../../common/common.module';
import { PermissionMethod } from '../../common/permission/permission.method';
import { Block4Permission } from '../entities/block/block4permission.entity';

describe('BlockController', () => {

  let app: INestApplication;
  let dataSource: DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TestDbModule,
        ExceptionModule,
        CommonModule,
        TypeOrmModule.forFeature([Block]),
      ],
      controllers: [BlockController],
      providers: [],
    }).compile();

    app = module.createNestApplication();
    dataSource = module.get<DataSource>(DataSource);
    await app.init();
  });

  afterEach(() => app.close());

  describe('GET /block', () => {
    it('should return an empty array when no blocks exist', async () => {
      const response = await request(app.getHttpServer())
        .get('/block')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return an array of blocks with relations', async () => {
      await dataSource.getRepository(Block).save({ id: 'block-1' });

      const response = await request(app.getHttpServer())
        .get('/block')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].id).toBe('block-1');
      expect(response.body[0].attributes).toEqual({
        strings: [],
        points: [],
        descriptions: [],
        counters: [],
      });
      expect(response.body[0].permissions).toEqual([]);
    });
  });

  describe('GET /block with pagination', () => {
    it('should return limited blocks when limit is provided', async () => {
      await dataSource.getRepository(Block).save({ id: 'block-1' });
      await dataSource.getRepository(Block).save({ id: 'block-2' });
      await dataSource.getRepository(Block).save({ id: 'block-3' });

      const response = await request(app.getHttpServer())
        .get('/block?limit=2')
        .expect(200);

      expect(response.body).toHaveLength(2);
    });

    it('should skip blocks when offset is provided', async () => {
      await dataSource.getRepository(Block).save({ id: 'block-1' });
      await dataSource.getRepository(Block).save({ id: 'block-2' });
      await dataSource.getRepository(Block).save({ id: 'block-3' });

      const response = await request(app.getHttpServer())
        .get('/block?offset=1')
        .expect(200);

      expect(response.body).toHaveLength(2);
    });

    it('should return paginated blocks when both limit and offset are provided', async () => {
      await dataSource.getRepository(Block).save({ id: 'block-1' });
      await dataSource.getRepository(Block).save({ id: 'block-2' });
      await dataSource.getRepository(Block).save({ id: 'block-3' });
      await dataSource.getRepository(Block).save({ id: 'block-4' });

      const response = await request(app.getHttpServer())
        .get('/block?limit=2&offset=1')
        .expect(200);

      expect(response.body).toHaveLength(2);
    });

    it('should return empty array when offset exceeds total blocks', async () => {
      await dataSource.getRepository(Block).save({ id: 'block-1' });

      const response = await request(app.getHttpServer())
        .get('/block?offset=10')
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });

  describe('GET /block/:id', () => {
    it('should return a single block with relations', async () => {
      await dataSource.getRepository(Block).save({ id: 'block-1' });
      await dataSource.getRepository(Block4Permission).save({ parentId: 'block-1', method: PermissionMethod.READ });

      const response = await request(app.getHttpServer())
        .get('/block/block-1')
        .expect(200);

      expect(response.body.id).toBe('block-1');
      expect(response.body.attributes).toEqual({
        strings: [],
        points: [],
        descriptions: [],
        counters: [],
      });
      expect(response.body.permissions).toHaveLength(1);
    });

    it('should return 404 for non-existent block', async () => {
      const response = await request(app.getHttpServer())
        .get('/block/non-existent-id')
        .expect(404);

      expect(response.body.message).toBe('Block with id non-existent-id not found');
      expect(response.body.details).toEqual({
        entity: 'Block',
        id: 'non-existent-id',
      });
    });

    it('should return 403 when no READ permission exists', async () => {
      await dataSource.getRepository(Block).save({ id: 'block-1' });

      const response = await request(app.getHttpServer())
        .get('/block/block-1')
        .expect(403);

      expect(response.body.message).toBe('Permission denied: READ on Block with id block-1');
    });
  });

  describe('POST /block', () => {
    it('should create and return a new block', async () => {
      const response = await request(app.getHttpServer())
        .post('/block')
        .send({ id: 'new-block' })
        .expect(201);

      expect(response.body.id).toBe('new-block');
      expect(response.body.attributes).toEqual({
        strings: [],
        points: [],
        descriptions: [],
        counters: [],
      });

      const found = await dataSource.getRepository(Block).findOne({ where: { id: 'new-block' } });
      expect(found).not.toBeNull();
    });

    it('should create block with strings', async () => {
      await dataSource.getRepository(Attribute).save({ id: 'name' });

      const response = await request(app.getHttpServer())
        .post('/block')
        .send({
          id: 'new-block',
          strings: [{ parentId: 'new-block', attributeId: 'name', value: 'Test Block' }],
        })
        .expect(201);

      expect(response.body.id).toBe('new-block');
      expect(response.body.attributes.strings).toHaveLength(1);
      expect(response.body.attributes.strings[0]).toEqual({
        lang: null,
        attr: 'name',
        value: 'Test Block',
      });
    });

    it('should create block with descriptions', async () => {
      await dataSource.getRepository(Attribute).save({ id: 'content' });

      const response = await request(app.getHttpServer())
        .post('/block')
        .send({
          id: 'new-block',
          descriptions: [{ parentId: 'new-block', attributeId: 'content', value: 'Long description text' }],
        })
        .expect(201);

      expect(response.body.id).toBe('new-block');
      expect(response.body.attributes.descriptions).toHaveLength(1);
      expect(response.body.attributes.descriptions[0]).toEqual({
        lang: null,
        attr: 'content',
        value: 'Long description text',
      });
    });

    it('should create block with permissions', async () => {
      await dataSource.getRepository(Group).save({ id: 'admins' });

      const response = await request(app.getHttpServer())
        .post('/block')
        .send({
          id: 'new-block',
          permissions: [{ parentId: 'new-block', groupId: 'admins', method: 'READ' }],
        })
        .expect(201);

      expect(response.body.id).toBe('new-block');
      expect(response.body.permissions).toHaveLength(1);
      expect(response.body.permissions[0]).toEqual({
        group: 'admins',
        method: 'READ',
      });
    });
  });

  describe('PUT /block/:id', () => {
    it('should return 404 for non-existent block', async () => {
      const response = await request(app.getHttpServer())
        .put('/block/non-existent-id')
        .send({})
        .expect(404);

      expect(response.body.message).toBe('Block with id non-existent-id not found');
      expect(response.body.details).toEqual({
        entity: 'Block',
        id: 'non-existent-id',
      });
    });

    it('should update and return the block', async () => {
      await dataSource.getRepository(Block).save({ id: 'block-1' });
      await dataSource.getRepository(Block4Permission).save({ parentId: 'block-1', method: PermissionMethod.WRITE });

      const response = await request(app.getHttpServer())
        .put('/block/block-1')
        .send({})
        .expect(200);

      expect(response.body.id).toBe('block-1');
    });

    it('should return 403 when no WRITE permission exists', async () => {
      await dataSource.getRepository(Block).save({ id: 'block-1' });

      const response = await request(app.getHttpServer())
        .put('/block/block-1')
        .send({})
        .expect(403);

      expect(response.body.message).toBe('Permission denied: WRITE on Block with id block-1');
    });
  });

  describe('DELETE /block/:id', () => {
    it('should return 404 for non-existent block', async () => {
      const response = await request(app.getHttpServer())
        .delete('/block/non-existent-id')
        .expect(404);

      expect(response.body.message).toBe('Block with id non-existent-id not found');
      expect(response.body.details).toEqual({
        entity: 'Block',
        id: 'non-existent-id',
      });
    });

    it('should delete the block', async () => {
      await dataSource.getRepository(Block).save({ id: 'block-1' });
      await dataSource.getRepository(Block4Permission).save({ parentId: 'block-1', method: PermissionMethod.DELETE });

      await request(app.getHttpServer())
        .delete('/block/block-1')
        .expect(200);

      const found = await dataSource.getRepository(Block).findOne({ where: { id: 'block-1' } });
      expect(found).toBeNull();
    });

    it('should return 403 when no DELETE permission exists', async () => {
      await dataSource.getRepository(Block).save({ id: 'block-1' });

      const response = await request(app.getHttpServer())
        .delete('/block/block-1')
        .expect(403);

      expect(response.body.message).toBe('Permission denied: DELETE on Block with id block-1');
    });
  });

});
