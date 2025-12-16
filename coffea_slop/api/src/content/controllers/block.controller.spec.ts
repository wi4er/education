import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import * as request from 'supertest';
import { BlockController } from './block.controller';
import { Block } from '../entities/block/block.entity';
import { Attribute } from '../../settings/entities/attribute/attribute.entity';
import { Group } from '../../personal/entities/group/group.entity';
import { PointAttributeService } from '../../common/services/point-attribute.service';
import { StringAttributeService } from '../../common/services/string-attribute.service';
import { PermissionAttributeService } from '../../common/services/permission-attribute.service';
import { DescriptionAttributeService } from '../../common/services/description-attribute.service';
import { TestDbModule } from '../../tests/test-db.module';
import { ExceptionModule } from '../../exception/exception.module';

describe('BlockController', () => {

  let app: INestApplication;
  let dataSource: DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TestDbModule,
        ExceptionModule,
        TypeOrmModule.forFeature([Block]),
      ],
      controllers: [BlockController],
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

  describe('GET /block', () => {
    it('should return an empty array when no blocks exist', async () => {
      const response = await request(app.getHttpServer())
        .get('/block')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return an array of blocks with relations', async () => {
      const repo = dataSource.getRepository(Block);
      await repo.save(repo.create({ id: 'block-1' }));

      const response = await request(app.getHttpServer())
        .get('/block')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].id).toBe('block-1');
      expect(response.body[0].attributes).toEqual({
        strings: [],
        points: [],
        descriptions: [],
      });
      expect(response.body[0].permissions).toEqual([]);
    });
  });

  describe('GET /block/:id', () => {
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

    it('should return a single block with relations', async () => {
      const repo = dataSource.getRepository(Block);
      await repo.save(repo.create({ id: 'block-1' }));

      const response = await request(app.getHttpServer())
        .get('/block/block-1')
        .expect(200);

      expect(response.body.id).toBe('block-1');
      expect(response.body.attributes).toEqual({
        strings: [],
        points: [],
        descriptions: [],
      });
      expect(response.body.permissions).toEqual([]);
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
      });

      const repo = dataSource.getRepository(Block);
      const found = await repo.findOne({ where: { id: 'new-block' } });
      expect(found).not.toBeNull();
    });

    it('should create block with strings', async () => {
      const attrRepo = dataSource.getRepository(Attribute);
      await attrRepo.save(attrRepo.create({ id: 'name' }));

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
      const attrRepo = dataSource.getRepository(Attribute);
      await attrRepo.save(attrRepo.create({ id: 'content' }));

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
      const groupRepo = dataSource.getRepository(Group);
      await groupRepo.save(groupRepo.create({ id: 'admins' }));

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
      const repo = dataSource.getRepository(Block);
      await repo.save(repo.create({ id: 'block-1' }));

      const response = await request(app.getHttpServer())
        .put('/block/block-1')
        .send({})
        .expect(200);

      expect(response.body.id).toBe('block-1');
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
      const repo = dataSource.getRepository(Block);
      await repo.save(repo.create({ id: 'block-1' }));

      await request(app.getHttpServer())
        .delete('/block/block-1')
        .expect(200);

      const found = await repo.findOne({ where: { id: 'block-1' } });
      expect(found).toBeNull();
    });
  });

});
