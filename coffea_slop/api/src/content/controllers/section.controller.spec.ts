import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import * as request from 'supertest';
import { SectionController } from './section.controller';
import { Section } from '../entities/section/section.entity';
import { Block } from '../entities/block/block.entity';
import { Attribute } from '../../settings/entities/attribute/attribute.entity';
import { Group } from '../../personal/entities/group/group.entity';
import { TestDbModule } from '../../tests/test-db.module';
import { ExceptionModule } from '../../exception/exception.module';
import { CommonModule } from '../../common/common.module';
import { PermissionMethod } from '../../common/permission/permission.method';
import { Section4Permission } from '../entities/section/section4permission.entity';

describe('SectionController', () => {

  let app: INestApplication;
  let dataSource: DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TestDbModule,
        ExceptionModule,
        CommonModule,
        TypeOrmModule.forFeature([Section]),
      ],
      controllers: [SectionController],
      providers: [],
    }).compile();

    app = module.createNestApplication();
    dataSource = module.get<DataSource>(DataSource);
    await app.init();
  });

  afterEach(() => app.close());

  describe('GET /section', () => {
    it('should return an empty array when no sections exist', async () => {
      const response = await request(app.getHttpServer())
        .get('/section')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return an array of sections with relations', async () => {
      await dataSource.getRepository(Block).save({ id: 'block-1' });
      await dataSource.getRepository(Section).save({ id: 'section-1', parentId: 'block-1' });

      const response = await request(app.getHttpServer())
        .get('/section')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].id).toBe('section-1');
      expect(response.body[0].parentId).toBe('block-1');
      expect(response.body[0].attributes).toEqual({
        strings: [],
        points: [],
        descriptions: [],
        counters: [],
      });
      expect(response.body[0].permissions).toEqual([]);
    });
  });

  describe('GET /section with pagination', () => {
    it('should return limited sections when limit is provided', async () => {
      await dataSource.getRepository(Block).save({ id: 'block-1' });
      await dataSource.getRepository(Section).save({ id: 'section-1', parentId: 'block-1' });
      await dataSource.getRepository(Section).save({ id: 'section-2', parentId: 'block-1' });
      await dataSource.getRepository(Section).save({ id: 'section-3', parentId: 'block-1' });

      const response = await request(app.getHttpServer())
        .get('/section?limit=2')
        .expect(200);

      expect(response.body).toHaveLength(2);
    });

    it('should skip sections when offset is provided', async () => {
      await dataSource.getRepository(Block).save({ id: 'block-1' });
      await dataSource.getRepository(Section).save({ id: 'section-1', parentId: 'block-1' });
      await dataSource.getRepository(Section).save({ id: 'section-2', parentId: 'block-1' });
      await dataSource.getRepository(Section).save({ id: 'section-3', parentId: 'block-1' });

      const response = await request(app.getHttpServer())
        .get('/section?offset=1')
        .expect(200);

      expect(response.body).toHaveLength(2);
    });

    it('should return paginated sections when both limit and offset are provided', async () => {
      await dataSource.getRepository(Block).save({ id: 'block-1' });
      await dataSource.getRepository(Section).save({ id: 'section-1', parentId: 'block-1' });
      await dataSource.getRepository(Section).save({ id: 'section-2', parentId: 'block-1' });
      await dataSource.getRepository(Section).save({ id: 'section-3', parentId: 'block-1' });
      await dataSource.getRepository(Section).save({ id: 'section-4', parentId: 'block-1' });

      const response = await request(app.getHttpServer())
        .get('/section?limit=2&offset=1')
        .expect(200);

      expect(response.body).toHaveLength(2);
    });

    it('should return empty array when offset exceeds total sections', async () => {
      await dataSource.getRepository(Block).save({ id: 'block-1' });
      await dataSource.getRepository(Section).save({ id: 'section-1', parentId: 'block-1' });

      const response = await request(app.getHttpServer())
        .get('/section?offset=10')
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });

  describe('GET /section/:id', () => {
    it('should return a single section with relations', async () => {
      await dataSource.getRepository(Block).save({ id: 'block-1' });
      await dataSource.getRepository(Section).save({ id: 'section-1', parentId: 'block-1' });
      await dataSource.getRepository(Section4Permission).save({ parentId: 'section-1', method: PermissionMethod.READ });

      const response = await request(app.getHttpServer())
        .get('/section/section-1')
        .expect(200);

      expect(response.body.id).toBe('section-1');
      expect(response.body.parentId).toBe('block-1');
      expect(response.body.attributes).toEqual({
        strings: [],
        points: [],
        descriptions: [],
        counters: [],
      });
      expect(response.body.permissions).toHaveLength(1);
    });

    it('should return 404 for non-existent section', async () => {
      const response = await request(app.getHttpServer())
        .get('/section/non-existent-id')
        .expect(404);

      expect(response.body.message).toBe('Section with id non-existent-id not found');
      expect(response.body.details).toEqual({
        entity: 'Section',
        id: 'non-existent-id',
      });
    });

    it('should return 403 when no READ permission exists', async () => {
      await dataSource.getRepository(Block).save({ id: 'block-1' });
      await dataSource.getRepository(Section).save({ id: 'section-1', parentId: 'block-1' });

      const response = await request(app.getHttpServer())
        .get('/section/section-1')
        .expect(403);

      expect(response.body.message).toBe('Permission denied: READ on Section with id section-1');
    });
  });

  describe('POST /section', () => {
    it('should create and return a new section', async () => {
      await dataSource.getRepository(Block).save({ id: 'block-1' });

      const response = await request(app.getHttpServer())
        .post('/section')
        .send({ id: 'new-section', parentId: 'block-1' })
        .expect(201);

      expect(response.body.id).toBe('new-section');
      expect(response.body.parentId).toBe('block-1');
      expect(response.body.attributes).toEqual({
        strings: [],
        points: [],
        descriptions: [],
        counters: [],
      });

      const found = await dataSource.getRepository(Section).findOne({ where: { id: 'new-section' } });
      expect(found).not.toBeNull();
    });

    it('should create section with strings', async () => {
      await dataSource.getRepository(Block).save({ id: 'block-1' });
      await dataSource.getRepository(Attribute).save({ id: 'name' });

      const response = await request(app.getHttpServer())
        .post('/section')
        .send({
          id: 'new-section',
          parentId: 'block-1',
          strings: [{ parentId: 'new-section', attributeId: 'name', value: 'Test Section' }],
        })
        .expect(201);

      expect(response.body.id).toBe('new-section');
      expect(response.body.attributes.strings).toHaveLength(1);
      expect(response.body.attributes.strings[0]).toEqual({
        lang: null,
        attr: 'name',
        value: 'Test Section',
      });
    });

    it('should create section with descriptions', async () => {
      await dataSource.getRepository(Block).save({ id: 'block-1' });
      await dataSource.getRepository(Attribute).save({ id: 'content' });

      const response = await request(app.getHttpServer())
        .post('/section')
        .send({
          id: 'new-section',
          parentId: 'block-1',
          descriptions: [{ parentId: 'new-section', attributeId: 'content', value: 'Long description text' }],
        })
        .expect(201);

      expect(response.body.id).toBe('new-section');
      expect(response.body.attributes.descriptions).toHaveLength(1);
      expect(response.body.attributes.descriptions[0]).toEqual({
        lang: null,
        attr: 'content',
        value: 'Long description text',
      });
    });

    it('should create section with permissions', async () => {
      await dataSource.getRepository(Block).save({ id: 'block-1' });
      await dataSource.getRepository(Group).save({ id: 'admins' });

      const response = await request(app.getHttpServer())
        .post('/section')
        .send({
          id: 'new-section',
          parentId: 'block-1',
          permissions: [{ parentId: 'new-section', groupId: 'admins', method: 'READ' }],
        })
        .expect(201);

      expect(response.body.id).toBe('new-section');
      expect(response.body.permissions).toHaveLength(1);
      expect(response.body.permissions[0]).toEqual({
        group: 'admins',
        method: 'READ',
      });
    });
  });

  describe('PUT /section/:id', () => {
    it('should return 404 for non-existent section', async () => {
      const response = await request(app.getHttpServer())
        .put('/section/non-existent-id')
        .send({ parentId: 'block-1' })
        .expect(404);

      expect(response.body.message).toBe('Section with id non-existent-id not found');
      expect(response.body.details).toEqual({
        entity: 'Section',
        id: 'non-existent-id',
      });
    });

    it('should update and return the section', async () => {
      const blockRepo = dataSource.getRepository(Block);
      await blockRepo.save({ id: 'block-1' });
      await blockRepo.save({ id: 'block-2' });
      await dataSource.getRepository(Section).save({ id: 'section-1', parentId: 'block-1' });
      await dataSource.getRepository(Section4Permission).save({ parentId: 'section-1', method: PermissionMethod.WRITE });

      const response = await request(app.getHttpServer())
        .put('/section/section-1')
        .send({ parentId: 'block-2' })
        .expect(200);

      expect(response.body.id).toBe('section-1');
      expect(response.body.parentId).toBe('block-2');
    });

    it('should return 403 when no WRITE permission exists', async () => {
      await dataSource.getRepository(Block).save({ id: 'block-1' });
      await dataSource.getRepository(Section).save({ id: 'section-1', parentId: 'block-1' });

      const response = await request(app.getHttpServer())
        .put('/section/section-1')
        .send({ parentId: 'block-1' })
        .expect(403);

      expect(response.body.message).toBe('Permission denied: WRITE on Section with id section-1');
    });
  });

  describe('DELETE /section/:id', () => {
    it('should return 404 for non-existent section', async () => {
      const response = await request(app.getHttpServer())
        .delete('/section/non-existent-id')
        .expect(404);

      expect(response.body.message).toBe('Section with id non-existent-id not found');
      expect(response.body.details).toEqual({
        entity: 'Section',
        id: 'non-existent-id',
      });
    });

    it('should delete the section', async () => {
      await dataSource.getRepository(Block).save({ id: 'block-1' });
      await dataSource.getRepository(Section).save({ id: 'section-1', parentId: 'block-1' });
      await dataSource.getRepository(Section4Permission).save({ parentId: 'section-1', method: PermissionMethod.DELETE });

      await request(app.getHttpServer())
        .delete('/section/section-1')
        .expect(200);

      const found = await dataSource.getRepository(Section).findOne({ where: { id: 'section-1' } });
      expect(found).toBeNull();
    });

    it('should return 403 when no DELETE permission exists', async () => {
      await dataSource.getRepository(Block).save({ id: 'block-1' });
      await dataSource.getRepository(Section).save({ id: 'section-1', parentId: 'block-1' });

      const response = await request(app.getHttpServer())
        .delete('/section/section-1')
        .expect(403);

      expect(response.body.message).toBe('Permission denied: DELETE on Section with id section-1');
    });
  });

});
