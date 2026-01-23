import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource, Repository, EntityTarget } from 'typeorm';
import * as request from 'supertest';
import { AttributeController } from './attribute.controller';
import { Attribute } from '../entities/attribute/attribute.entity';
import { AsPointService } from '../services/as-point.service';
import { TestDbModule } from '../../tests/test-db.module';
import { ExceptionModule } from '../../exception/exception.module';
import { CommonModule } from '../../common/common.module';

describe('AttributeController', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let repo: <T>(target: EntityTarget<T>) => Repository<T>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TestDbModule,
        ExceptionModule,
        CommonModule,
        TypeOrmModule.forFeature([Attribute]),
      ],
      controllers: [AttributeController],
      providers: [AsPointService],
    }).compile();

    app = module.createNestApplication();
    dataSource = module.get<DataSource>(DataSource);
    await app.init();

    repo = dataSource.getRepository.bind(dataSource);
  });

  afterEach(() => app.close());

  describe('GET /attribute', () => {
    it('should return an empty array when no attributes exist', async () => {
      const response = await request(app.getHttpServer())
        .get('/attribute')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return an array of attributes with relations', async () => {
      await repo(Attribute).save({ id: 'attr-1' });

      const response = await request(app.getHttpServer())
        .get('/attribute')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].id).toBe('attr-1');
      expect(response.body[0].attributes).toEqual({
        strings: [],
        points: [],
      });
    });
  });

  describe('GET /attribute with pagination', () => {
    it('should return limited attributes when limit is provided', async () => {
      await repo(Attribute).save({ id: 'attr-1' });
      await repo(Attribute).save({ id: 'attr-2' });
      await repo(Attribute).save({ id: 'attr-3' });

      const response = await request(app.getHttpServer())
        .get('/attribute?limit=2')
        .expect(200);

      expect(response.body).toHaveLength(2);
    });

    it('should skip attributes when offset is provided', async () => {
      await repo(Attribute).save({ id: 'attr-1' });
      await repo(Attribute).save({ id: 'attr-2' });
      await repo(Attribute).save({ id: 'attr-3' });

      const response = await request(app.getHttpServer())
        .get('/attribute?offset=1')
        .expect(200);

      expect(response.body).toHaveLength(2);
    });

    it('should return paginated attributes when both limit and offset are provided', async () => {
      await repo(Attribute).save({ id: 'attr-1' });
      await repo(Attribute).save({ id: 'attr-2' });
      await repo(Attribute).save({ id: 'attr-3' });
      await repo(Attribute).save({ id: 'attr-4' });

      const response = await request(app.getHttpServer())
        .get('/attribute?limit=2&offset=1')
        .expect(200);

      expect(response.body).toHaveLength(2);
    });

    it('should return empty array when offset exceeds total attributes', async () => {
      await repo(Attribute).save({ id: 'attr-1' });

      const response = await request(app.getHttpServer())
        .get('/attribute?offset=10')
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });

  describe('GET /attribute/:id', () => {
    it('should return 404 for non-existent attribute', async () => {
      const response = await request(app.getHttpServer())
        .get('/attribute/non-existent-id')
        .expect(404);

      expect(response.body.message).toBe(
        'Attribute with id non-existent-id not found',
      );
      expect(response.body.details).toEqual({
        entity: 'Attribute',
        id: 'non-existent-id',
      });
    });

    it('should return a single attribute with relations', async () => {
      await repo(Attribute).save({ id: 'attr-1' });

      const response = await request(app.getHttpServer())
        .get('/attribute/attr-1')
        .expect(200);

      expect(response.body.id).toBe('attr-1');
      expect(response.body.attributes).toEqual({
        strings: [],
        points: [],
      });
    });
  });

  describe('POST /attribute', () => {
    it('should create and return a new attribute', async () => {
      const response = await request(app.getHttpServer())
        .post('/attribute')
        .send({ id: 'new-attr' })
        .expect(201);

      expect(response.body.id).toBe('new-attr');
      expect(response.body.attributes).toEqual({
        strings: [],
        points: [],
      });

      const found = await repo(Attribute).findOne({ where: { id: 'new-attr' } });
      expect(found).not.toBeNull();
    });

    it('should create attribute with strings', async () => {
      await repo(Attribute).save({ id: 'label' });

      const response = await request(app.getHttpServer())
        .post('/attribute')
        .send({
          id: 'new-attr',
          strings: [{ attr: 'label', value: 'Test Label' }],
        })
        .expect(201);

      expect(response.body.id).toBe('new-attr');
      expect(response.body.attributes.strings).toHaveLength(1);
      expect(response.body.attributes.strings[0]).toEqual({
        lang: null,
        attr: 'label',
        value: 'Test Label',
      });
    });

    it('should return 400 when id is empty string', async () => {
      const response = await request(app.getHttpServer())
        .post('/attribute')
        .send({ id: '' })
        .expect(400);

      expect(response.body.message).toBe('Database query failed');
    });
  });

  describe('PUT /attribute/:id', () => {
    it('should return 404 for non-existent attribute', async () => {
      const response = await request(app.getHttpServer())
        .put('/attribute/non-existent-id')
        .send({})
        .expect(404);

      expect(response.body.message).toBe(
        'Attribute with id non-existent-id not found',
      );
      expect(response.body.details).toEqual({
        entity: 'Attribute',
        id: 'non-existent-id',
      });
    });

    it('should update and return the attribute', async () => {
      await repo(Attribute).save({ id: 'attr-1' });

      const response = await request(app.getHttpServer())
        .put('/attribute/attr-1')
        .send({})
        .expect(200);

      expect(response.body.id).toBe('attr-1');
    });
  });

  describe('DELETE /attribute/:id', () => {
    it('should return 404 for non-existent attribute', async () => {
      const response = await request(app.getHttpServer())
        .delete('/attribute/non-existent-id')
        .expect(404);

      expect(response.body.message).toBe(
        'Attribute with id non-existent-id not found',
      );
      expect(response.body.details).toEqual({
        entity: 'Attribute',
        id: 'non-existent-id',
      });
    });

    it('should delete the attribute', async () => {
      await repo(Attribute).save({ id: 'attr-1' });

      await request(app.getHttpServer())
        .delete('/attribute/attr-1')
        .expect(200);

      const found = await repo(Attribute).findOne({ where: { id: 'attr-1' } });
      expect(found).toBeNull();
    });
  });
});
