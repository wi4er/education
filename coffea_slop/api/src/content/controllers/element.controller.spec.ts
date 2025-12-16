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
import { PointAttributeService } from '../../common/services/point-attribute.service';
import { StringAttributeService } from '../../common/services/string-attribute.service';
import { PermissionAttributeService } from '../../common/services/permission-attribute.service';
import { DescriptionAttributeService } from '../../common/services/description-attribute.service';
import { TestDbModule } from '../../tests/test-db.module';
import { ExceptionModule } from '../../exception/exception.module';

describe('ElementController', () => {

  let app: INestApplication;
  let dataSource: DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TestDbModule,
        ExceptionModule,
        TypeOrmModule.forFeature([Element]),
      ],
      controllers: [ElementController],
      providers: [
        PointAttributeService,
        StringAttributeService,
        PermissionAttributeService,
        DescriptionAttributeService,
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
      const blockRepo = dataSource.getRepository(Block);
      await blockRepo.save(blockRepo.create({ id: 'block-1' }));

      const repo = dataSource.getRepository(Element);
      await repo.save(repo.create({ id: 'element-1', blockId: 'block-1' }));

      const response = await request(app.getHttpServer())
        .get('/element')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].id).toBe('element-1');
      expect(response.body[0].blockId).toBe('block-1');
      expect(response.body[0].attributes).toEqual({
        strings: [],
        points: [],
        descriptions: [],
      });
      expect(response.body[0].permissions).toEqual([]);
      expect(response.body[0].sections).toEqual([]);
    });
  });

  describe('GET /element/:id', () => {
    it('should return a single element with relations', async () => {
      const blockRepo = dataSource.getRepository(Block);
      await blockRepo.save(blockRepo.create({ id: 'block-1' }));

      const repo = dataSource.getRepository(Element);
      await repo.save(repo.create({ id: 'element-1', blockId: 'block-1' }));

      const response = await request(app.getHttpServer())
        .get('/element/element-1')
        .expect(200);

      expect(response.body.id).toBe('element-1');
      expect(response.body.blockId).toBe('block-1');
      expect(response.body.attributes).toEqual({
        strings: [],
        points: [],
        descriptions: [],
      });
      expect(response.body.permissions).toEqual([]);
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
  });

  describe('PUT /element/:id', () => {
    it('should return 404 for non-existent element', async () => {
      const response = await request(app.getHttpServer())
        .put('/element/non-existent-id')
        .send({ blockId: 'block-1' })
        .expect(404);

      expect(response.body.message).toBe('Element with id non-existent-id not found');
      expect(response.body.details).toEqual({
        entity: 'Element',
        id: 'non-existent-id',
      });
    });

    it('should update and return the element', async () => {
      const blockRepo = dataSource.getRepository(Block);
      await blockRepo.save(blockRepo.create({ id: 'block-1' }));
      await blockRepo.save(blockRepo.create({ id: 'block-2' }));

      const repo = dataSource.getRepository(Element);
      await repo.save(repo.create({ id: 'element-1', blockId: 'block-1' }));

      const response = await request(app.getHttpServer())
        .put('/element/element-1')
        .send({ blockId: 'block-2' })
        .expect(200);

      expect(response.body.id).toBe('element-1');
      expect(response.body.blockId).toBe('block-2');
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
      const blockRepo = dataSource.getRepository(Block);
      await blockRepo.save(blockRepo.create({ id: 'block-1' }));

      const repo = dataSource.getRepository(Element);
      await repo.save(repo.create({ id: 'element-1', blockId: 'block-1' }));

      await request(app.getHttpServer())
        .delete('/element/element-1')
        .expect(200);

      const found = await repo.findOne({ where: { id: 'element-1' } });
      expect(found).toBeNull();
    });
  });

  describe('POST /element', () => {
    it('should create and return a new element', async () => {
      const blockRepo = dataSource.getRepository(Block);
      await blockRepo.save(blockRepo.create({ id: 'block-1' }));

      const response = await request(app.getHttpServer())
        .post('/element')
        .send({ id: 'new-element', blockId: 'block-1' })
        .expect(201);

      expect(response.body.id).toBe('new-element');
      expect(response.body.blockId).toBe('block-1');
      expect(response.body.attributes).toEqual({
        strings: [],
        points: [],
        descriptions: [],
      });

      const repo = dataSource.getRepository(Element);
      const found = await repo.findOne({ where: { id: 'new-element' } });
      expect(found).not.toBeNull();
    });

    it('should create element with strings', async () => {
      const blockRepo = dataSource.getRepository(Block);
      await blockRepo.save(blockRepo.create({ id: 'block-1' }));

      const attrRepo = dataSource.getRepository(Attribute);
      await attrRepo.save(attrRepo.create({ id: 'name' }));

      const response = await request(app.getHttpServer())
        .post('/element')
        .send({
          id: 'new-element',
          blockId: 'block-1',
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
      const blockRepo = dataSource.getRepository(Block);
      await blockRepo.save(blockRepo.create({ id: 'block-1' }));

      const attrRepo = dataSource.getRepository(Attribute);
      await attrRepo.save(attrRepo.create({ id: 'content' }));

      const response = await request(app.getHttpServer())
        .post('/element')
        .send({
          id: 'new-element',
          blockId: 'block-1',
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
      const blockRepo = dataSource.getRepository(Block);
      await blockRepo.save(blockRepo.create({ id: 'block-1' }));

      const groupRepo = dataSource.getRepository(Group);
      await groupRepo.save(groupRepo.create({ id: 'admins' }));

      const response = await request(app.getHttpServer())
        .post('/element')
        .send({
          id: 'new-element',
          blockId: 'block-1',
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
      const blockRepo = dataSource.getRepository(Block);
      await blockRepo.save(blockRepo.create({ id: 'block-1' }));

      const sectionRepo = dataSource.getRepository(Section);
      await sectionRepo.save(sectionRepo.create({ id: 'section-1', blockId: 'block-1' }));

      const response = await request(app.getHttpServer())
        .post('/element')
        .send({
          id: 'new-element',
          blockId: 'block-1',
          sections: ['section-1'],
        })
        .expect(201);

      expect(response.body.id).toBe('new-element');
      expect(response.body.sections).toHaveLength(1);
      expect(response.body.sections[0]).toBe('section-1');
    });
  });

});
