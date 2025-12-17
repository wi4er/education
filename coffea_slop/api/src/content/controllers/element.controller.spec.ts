import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import * as request from 'supertest';
import { ElementController } from './element.controller';
import { Element } from '../entities/element/element.entity';
import { Block } from '../entities/block/block.entity';
import { Section } from '../entities/section/section.entity';
import { Attribute } from '../../settings/entities/attribute/attribute.entity';
import { Group } from '../../personal/entities/group/group.entity';
import { TestDbModule } from '../../tests/test-db.module';
import { ExceptionModule } from '../../exception/exception.module';
import { CommonModule } from '../../common/common.module';
import { PermissionMethod } from '../../common/permission/permission.method';
import { Element4Permission } from '../entities/element/element4permission.entity';
import { SectionService } from '../services/section.service';

describe('ElementController', () => {

  let app: INestApplication;
  let dataSource: DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TestDbModule,
        ExceptionModule,
        CommonModule,
        TypeOrmModule.forFeature([Element]),
      ],
      controllers: [ElementController],
      providers: [
        SectionService
      ],
    }).compile();

    app = module.createNestApplication();
    dataSource = module.get<DataSource>(DataSource);
    await app.init();
  });

  afterEach(() => app.close());

  describe('GET /element', () => {
    it('should return an empty array when no elements exist', async () => {
      const response = await request(app.getHttpServer())
        .get('/element')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return an array of elements with relations', async () => {
      await dataSource.getRepository(Block).save({ id: 'block-1' });
      await dataSource.getRepository(Element).save({ id: 'element-1', parentId: 'block-1' });

      const response = await request(app.getHttpServer())
        .get('/element')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].id).toBe('element-1');
      expect(response.body[0].parentId).toBe('block-1');
      expect(response.body[0].attributes).toEqual({
        strings: [],
        points: [],
        descriptions: [],
        counters: [],
      });
      expect(response.body[0].permissions).toEqual([]);
      expect(response.body[0].sections).toEqual([]);
    });
  });

  describe('GET /element with pagination', () => {
    it('should return limited elements when limit is provided', async () => {
      await dataSource.getRepository(Block).save({ id: 'block-1' });
      await dataSource.getRepository(Element).save({ id: 'element-1', parentId: 'block-1' });
      await dataSource.getRepository(Element).save({ id: 'element-2', parentId: 'block-1' });
      await dataSource.getRepository(Element).save({ id: 'element-3', parentId: 'block-1' });

      const response = await request(app.getHttpServer())
        .get('/element?limit=2')
        .expect(200);

      expect(response.body).toHaveLength(2);
    });

    it('should skip elements when offset is provided', async () => {
      await dataSource.getRepository(Block).save({ id: 'block-1' });
      await dataSource.getRepository(Element).save({ id: 'element-1', parentId: 'block-1' });
      await dataSource.getRepository(Element).save({ id: 'element-2', parentId: 'block-1' });
      await dataSource.getRepository(Element).save({ id: 'element-3', parentId: 'block-1' });

      const response = await request(app.getHttpServer())
        .get('/element?offset=1')
        .expect(200);

      expect(response.body).toHaveLength(2);
    });

    it('should return paginated elements when both limit and offset are provided', async () => {
      await dataSource.getRepository(Block).save({ id: 'block-1' });
      await dataSource.getRepository(Element).save({ id: 'element-1', parentId: 'block-1' });
      await dataSource.getRepository(Element).save({ id: 'element-2', parentId: 'block-1' });
      await dataSource.getRepository(Element).save({ id: 'element-3', parentId: 'block-1' });
      await dataSource.getRepository(Element).save({ id: 'element-4', parentId: 'block-1' });

      const response = await request(app.getHttpServer())
        .get('/element?limit=2&offset=1')
        .expect(200);

      expect(response.body).toHaveLength(2);
    });

    it('should return empty array when offset exceeds total elements', async () => {
      await dataSource.getRepository(Block).save({ id: 'block-1' });
      await dataSource.getRepository(Element).save({ id: 'element-1', parentId: 'block-1' });

      const response = await request(app.getHttpServer())
        .get('/element?offset=10')
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });

  describe('GET /element/:id', () => {
    it('should return a single element with relations', async () => {
      await dataSource.getRepository(Block).save({ id: 'block-1' });
      await dataSource.getRepository(Element).save({ id: 'element-1', parentId: 'block-1' });
      await dataSource.getRepository(Element4Permission).save({ parentId: 'element-1', method: PermissionMethod.READ });

      const response = await request(app.getHttpServer())
        .get('/element/element-1')
        .expect(200);

      expect(response.body.id).toBe('element-1');
      expect(response.body.parentId).toBe('block-1');
      expect(response.body.attributes).toEqual({
        strings: [],
        points: [],
        descriptions: [],
        counters: [],
      });
      expect(response.body.permissions).toHaveLength(1);
    });

    it('should return 404 for non-existent element', async () => {
      const response = await request(app.getHttpServer())
        .get('/element/non-existent-id')
        .expect(404);

      expect(response.body.message).toBe('Element with id non-existent-id not found');
      expect(response.body.details).toEqual({
        entity: 'Element',
        id: 'non-existent-id',
      });
    });

    it('should return 403 when no READ permission exists', async () => {
      await dataSource.getRepository(Block).save({ id: 'block-1' });
      await dataSource.getRepository(Element).save({ id: 'element-1', parentId: 'block-1' });

      const response = await request(app.getHttpServer())
        .get('/element/element-1')
        .expect(403);

      expect(response.body.message).toBe('Permission denied: READ on Element with id element-1');
    });
  });

  describe('PUT /element/:id', () => {
    it('should return 404 for non-existent element', async () => {
      const response = await request(app.getHttpServer())
        .put('/element/non-existent-id')
        .send({ parentId: 'block-1' })
        .expect(404);

      expect(response.body.message).toBe('Element with id non-existent-id not found');
      expect(response.body.details).toEqual({
        entity: 'Element',
        id: 'non-existent-id',
      });
    });

    it('should update and return the element', async () => {
      const blockRepo = dataSource.getRepository(Block);
      await blockRepo.save({ id: 'block-1' });
      await blockRepo.save({ id: 'block-2' });
      await dataSource.getRepository(Element).save({ id: 'element-1', parentId: 'block-1' });
      await dataSource.getRepository(Element4Permission).save({ parentId: 'element-1', method: PermissionMethod.WRITE });

      const response = await request(app.getHttpServer())
        .put('/element/element-1')
        .send({ parentId: 'block-2' })
        .expect(200);

      expect(response.body.id).toBe('element-1');
      expect(response.body.parentId).toBe('block-2');
    });

    it('should return 403 when no WRITE permission exists', async () => {
      await dataSource.getRepository(Block).save({ id: 'block-1' });
      await dataSource.getRepository(Element).save({ id: 'element-1', parentId: 'block-1' });

      const response = await request(app.getHttpServer())
        .put('/element/element-1')
        .send({ parentId: 'block-1' })
        .expect(403);

      expect(response.body.message).toBe('Permission denied: WRITE on Element with id element-1');
    });
  });

  describe('DELETE /element/:id', () => {
    it('should return 404 for non-existent element', async () => {
      const response = await request(app.getHttpServer())
        .delete('/element/non-existent-id')
        .expect(404);

      expect(response.body.message).toBe('Element with id non-existent-id not found');
      expect(response.body.details).toEqual({
        entity: 'Element',
        id: 'non-existent-id',
      });
    });

    it('should delete the element', async () => {
      await dataSource.getRepository(Block).save({ id: 'block-1' });
      await dataSource.getRepository(Element).save({ id: 'element-1', parentId: 'block-1' });
      await dataSource.getRepository(Element4Permission).save({ parentId: 'element-1', method: PermissionMethod.DELETE });

      await request(app.getHttpServer())
        .delete('/element/element-1')
        .expect(200);

      const found = await dataSource.getRepository(Element).findOne({ where: { id: 'element-1' } });
      expect(found).toBeNull();
    });

    it('should return 403 when no DELETE permission exists', async () => {
      await dataSource.getRepository(Block).save({ id: 'block-1' });
      await dataSource.getRepository(Element).save({ id: 'element-1', parentId: 'block-1' });

      const response = await request(app.getHttpServer())
        .delete('/element/element-1')
        .expect(403);

      expect(response.body.message).toBe('Permission denied: DELETE on Element with id element-1');
    });
  });

  describe('POST /element', () => {
    it('should create and return a new element', async () => {
      await dataSource.getRepository(Block).save({ id: 'block-1' });

      const response = await request(app.getHttpServer())
        .post('/element')
        .send({ id: 'new-element', parentId: 'block-1' })
        .expect(201);

      expect(response.body.id).toBe('new-element');
      expect(response.body.parentId).toBe('block-1');
      expect(response.body.attributes).toEqual({
        strings: [],
        points: [],
        descriptions: [],
        counters: [],
      });

      const found = await dataSource.getRepository(Element).findOne({ where: { id: 'new-element' } });
      expect(found).not.toBeNull();
    });

    it('should create element with strings', async () => {
      await dataSource.getRepository(Block).save({ id: 'block-1' });
      await dataSource.getRepository(Attribute).save({ id: 'name' });

      const response = await request(app.getHttpServer())
        .post('/element')
        .send({
          id: 'new-element',
          parentId: 'block-1',
          strings: [{ parentId: 'new-element', attributeId: 'name', value: 'Test Element' }],
        })
        .expect(201);

      expect(response.body.id).toBe('new-element');
      expect(response.body.attributes.strings).toHaveLength(1);
      expect(response.body.attributes.strings[0]).toEqual({
        lang: null,
        attr: 'name',
        value: 'Test Element',
      });
    });

    it('should create element with descriptions', async () => {
      await dataSource.getRepository(Block).save({ id: 'block-1' });
      await dataSource.getRepository(Attribute).save({ id: 'content' });

      const response = await request(app.getHttpServer())
        .post('/element')
        .send({
          id: 'new-element',
          parentId: 'block-1',
          descriptions: [{ parentId: 'new-element', attributeId: 'content', value: 'Long description text' }],
        })
        .expect(201);

      expect(response.body.id).toBe('new-element');
      expect(response.body.attributes.descriptions).toHaveLength(1);
      expect(response.body.attributes.descriptions[0]).toEqual({
        lang: null,
        attr: 'content',
        value: 'Long description text',
      });
    });

    it('should create element with permissions', async () => {
      await dataSource.getRepository(Block).save({ id: 'block-1' });
      await dataSource.getRepository(Group).save({ id: 'admins' });

      const response = await request(app.getHttpServer())
        .post('/element')
        .send({
          id: 'new-element',
          parentId: 'block-1',
          permissions: [{ parentId: 'new-element', groupId: 'admins', method: 'READ' }],
        })
        .expect(201);

      expect(response.body.id).toBe('new-element');
      expect(response.body.permissions).toHaveLength(1);
      expect(response.body.permissions[0]).toEqual({
        group: 'admins',
        method: 'READ',
      });
    });

    it('should create element with sections', async () => {
      await dataSource.getRepository(Block).save({ id: 'block-1' });
      await dataSource.getRepository(Section).save({ id: 'section-1', parentId: 'block-1' });

      const response = await request(app.getHttpServer())
        .post('/element')
        .send({
          id: 'new-element',
          parentId: 'block-1',
          sections: ['section-1'],
        })
        .expect(201);

      expect(response.body.id).toBe('new-element');
      expect(response.body.sections).toHaveLength(1);
      expect(response.body.sections[0]).toBe('section-1');
    });
  });

});
