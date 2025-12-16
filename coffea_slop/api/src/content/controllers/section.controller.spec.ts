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
import { PointAttributeService } from '../../common/services/point-attribute.service';
import { StringAttributeService } from '../../common/services/string-attribute.service';
import { PermissionAttributeService } from '../../common/services/permission-attribute.service';
import { DescriptionAttributeService } from '../../common/services/description-attribute.service';
import { TestDbModule } from '../../tests/test-db.module';
import { ExceptionModule } from '../../exception/exception.module';

describe('SectionController', () => {

  let app: INestApplication;
  let dataSource: DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TestDbModule,
        ExceptionModule,
        TypeOrmModule.forFeature([Section]),
      ],
      controllers: [SectionController],
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

  afterEach(async () => {
    await app.close();
  });

  describe('GET /section', () => {
    it('should return an empty array when no sections exist', async () => {
      const response = await request(app.getHttpServer())
        .get('/section')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return an array of sections with relations', async () => {
      const blockRepo = dataSource.getRepository(Block);
      await blockRepo.save(blockRepo.create({ id: 'block-1' }));

      const repo = dataSource.getRepository(Section);
      await repo.save(repo.create({ id: 'section-1', blockId: 'block-1' }));

      const response = await request(app.getHttpServer())
        .get('/section')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].id).toBe('section-1');
      expect(response.body[0].blockId).toBe('block-1');
      expect(response.body[0].attributes).toEqual({
        strings: [],
        points: [],
        descriptions: [],
      });
      expect(response.body[0].permissions).toEqual([]);
    });
  });

  describe('GET /section/:id', () => {
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

    it('should return a single section with relations', async () => {
      const blockRepo = dataSource.getRepository(Block);
      await blockRepo.save(blockRepo.create({ id: 'block-1' }));

      const repo = dataSource.getRepository(Section);
      await repo.save(repo.create({ id: 'section-1', blockId: 'block-1' }));

      const response = await request(app.getHttpServer())
        .get('/section/section-1')
        .expect(200);

      expect(response.body.id).toBe('section-1');
      expect(response.body.blockId).toBe('block-1');
      expect(response.body.attributes).toEqual({
        strings: [],
        points: [],
        descriptions: [],
      });
      expect(response.body.permissions).toEqual([]);
    });
  });

  describe('POST /section', () => {
    it('should create and return a new section', async () => {
      const blockRepo = dataSource.getRepository(Block);
      await blockRepo.save(blockRepo.create({ id: 'block-1' }));

      const response = await request(app.getHttpServer())
        .post('/section')
        .send({ id: 'new-section', blockId: 'block-1' })
        .expect(201);

      expect(response.body.id).toBe('new-section');
      expect(response.body.blockId).toBe('block-1');
      expect(response.body.attributes).toEqual({
        strings: [],
        points: [],
        descriptions: [],
      });

      const repo = dataSource.getRepository(Section);
      const found = await repo.findOne({ where: { id: 'new-section' } });
      expect(found).not.toBeNull();
    });

    it('should create section with strings', async () => {
      const blockRepo = dataSource.getRepository(Block);
      await blockRepo.save(blockRepo.create({ id: 'block-1' }));

      const attrRepo = dataSource.getRepository(Attribute);
      await attrRepo.save(attrRepo.create({ id: 'name' }));

      const response = await request(app.getHttpServer())
        .post('/section')
        .send({
          id: 'new-section',
          blockId: 'block-1',
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
      const blockRepo = dataSource.getRepository(Block);
      await blockRepo.save(blockRepo.create({ id: 'block-1' }));

      const attrRepo = dataSource.getRepository(Attribute);
      await attrRepo.save(attrRepo.create({ id: 'content' }));

      const response = await request(app.getHttpServer())
        .post('/section')
        .send({
          id: 'new-section',
          blockId: 'block-1',
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
      const blockRepo = dataSource.getRepository(Block);
      await blockRepo.save(blockRepo.create({ id: 'block-1' }));

      const groupRepo = dataSource.getRepository(Group);
      await groupRepo.save(groupRepo.create({ id: 'admins' }));

      const response = await request(app.getHttpServer())
        .post('/section')
        .send({
          id: 'new-section',
          blockId: 'block-1',
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
        .send({ blockId: 'block-1' })
        .expect(404);

      expect(response.body.message).toBe('Section with id non-existent-id not found');
      expect(response.body.details).toEqual({
        entity: 'Section',
        id: 'non-existent-id',
      });
    });

    it('should update and return the section', async () => {
      const blockRepo = dataSource.getRepository(Block);
      await blockRepo.save(blockRepo.create({ id: 'block-1' }));
      await blockRepo.save(blockRepo.create({ id: 'block-2' }));

      const repo = dataSource.getRepository(Section);
      await repo.save(repo.create({ id: 'section-1', blockId: 'block-1' }));

      const response = await request(app.getHttpServer())
        .put('/section/section-1')
        .send({ blockId: 'block-2' })
        .expect(200);

      expect(response.body.id).toBe('section-1');
      expect(response.body.blockId).toBe('block-2');
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
      const blockRepo = dataSource.getRepository(Block);
      await blockRepo.save(blockRepo.create({ id: 'block-1' }));

      const repo = dataSource.getRepository(Section);
      await repo.save(repo.create({ id: 'section-1', blockId: 'block-1' }));

      await request(app.getHttpServer())
        .delete('/section/section-1')
        .expect(200);

      const found = await repo.findOne({ where: { id: 'section-1' } });
      expect(found).toBeNull();
    });
  });

});
