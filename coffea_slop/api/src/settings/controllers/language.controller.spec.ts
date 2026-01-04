import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import * as request from 'supertest';
import { LanguageController } from './language.controller';
import { Language } from '../entities/language/language.entity';
import { Attribute } from '../entities/attribute/attribute.entity';
import { TestDbModule } from '../../tests/test-db.module';
import { ExceptionModule } from '../../exception/exception.module';
import { CommonModule } from '../../common/common.module';

describe('LanguageController', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let repo;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TestDbModule,
        ExceptionModule,
        CommonModule,
        TypeOrmModule.forFeature([Language]),
      ],
      controllers: [LanguageController],
      providers: [],
    }).compile();

    app = module.createNestApplication();
    dataSource = module.get<DataSource>(DataSource);
    await app.init();

    repo = dataSource.getRepository.bind(dataSource);
  });

  afterEach(() => app.close());

  describe('GET /language', () => {
    it('should return an empty array when no languages exist', async () => {
      const response = await request(app.getHttpServer())
        .get('/language')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return an array of languages with relations', async () => {
      await repo(Language).save({ id: 'lang-1' });

      const response = await request(app.getHttpServer())
        .get('/language')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].id).toBe('lang-1');
      expect(response.body[0].attributes).toEqual({
        strings: [],
        points: [],
      });
    });
  });

  describe('GET /language with pagination', () => {
    it('should return limited languages when limit is provided', async () => {
      await repo(Language).save({ id: 'lang-1' });
      await repo(Language).save({ id: 'lang-2' });
      await repo(Language).save({ id: 'lang-3' });

      const response = await request(app.getHttpServer())
        .get('/language?limit=2')
        .expect(200);

      expect(response.body).toHaveLength(2);
    });

    it('should skip languages when offset is provided', async () => {
      await repo(Language).save({ id: 'lang-1' });
      await repo(Language).save({ id: 'lang-2' });
      await repo(Language).save({ id: 'lang-3' });

      const response = await request(app.getHttpServer())
        .get('/language?offset=1')
        .expect(200);

      expect(response.body).toHaveLength(2);
    });

    it('should return paginated languages when both limit and offset are provided', async () => {
      await repo(Language).save({ id: 'lang-1' });
      await repo(Language).save({ id: 'lang-2' });
      await repo(Language).save({ id: 'lang-3' });
      await repo(Language).save({ id: 'lang-4' });

      const response = await request(app.getHttpServer())
        .get('/language?limit=2&offset=1')
        .expect(200);

      expect(response.body).toHaveLength(2);
    });

    it('should return empty array when offset exceeds total languages', async () => {
      await repo(Language).save({ id: 'lang-1' });

      const response = await request(app.getHttpServer())
        .get('/language?offset=10')
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });

  describe('GET /language/:id', () => {
    it('should return 404 for non-existent language', async () => {
      const response = await request(app.getHttpServer())
        .get('/language/non-existent-id')
        .expect(404);

      expect(response.body.message).toBe(
        'Language with id non-existent-id not found',
      );
      expect(response.body.details).toEqual({
        entity: 'Language',
        id: 'non-existent-id',
      });
    });

    it('should return a single language with relations', async () => {
      await repo(Language).save({ id: 'lang-1' });

      const response = await request(app.getHttpServer())
        .get('/language/lang-1')
        .expect(200);

      expect(response.body.id).toBe('lang-1');
      expect(response.body.attributes).toEqual({
        strings: [],
        points: [],
      });
    });
  });

  describe('POST /language', () => {
    it('should create and return a new language', async () => {
      const response = await request(app.getHttpServer())
        .post('/language')
        .send({ id: 'new-lang' })
        .expect(201);

      expect(response.body.id).toBe('new-lang');
      expect(response.body.attributes).toEqual({
        strings: [],
        points: [],
      });

      const found = await repo(Language).findOne({ where: { id: 'new-lang' } });
      expect(found).not.toBeNull();
    });

    it('should create language with strings', async () => {
      await repo(Attribute).save({ id: 'name' });

      const response = await request(app.getHttpServer())
        .post('/language')
        .send({
          id: 'new-lang',
          strings: [{ attr: 'name', value: 'English' }],
        })
        .expect(201);

      expect(response.body.id).toBe('new-lang');
      expect(response.body.attributes.strings).toHaveLength(1);
      expect(response.body.attributes.strings[0]).toEqual({
        lang: null,
        attr: 'name',
        value: 'English',
      });
    });
  });

  describe('PUT /language/:id', () => {
    it('should return 404 for non-existent language', async () => {
      const response = await request(app.getHttpServer())
        .put('/language/non-existent-id')
        .send({})
        .expect(404);

      expect(response.body.message).toBe(
        'Language with id non-existent-id not found',
      );
      expect(response.body.details).toEqual({
        entity: 'Language',
        id: 'non-existent-id',
      });
    });

    it('should update and return the language', async () => {
      await repo(Language).save({ id: 'lang-1' });

      const response = await request(app.getHttpServer())
        .put('/language/lang-1')
        .send({})
        .expect(200);

      expect(response.body.id).toBe('lang-1');
    });
  });

  describe('DELETE /language/:id', () => {
    it('should return 404 for non-existent language', async () => {
      const response = await request(app.getHttpServer())
        .delete('/language/non-existent-id')
        .expect(404);

      expect(response.body.message).toBe(
        'Language with id non-existent-id not found',
      );
      expect(response.body.details).toEqual({
        entity: 'Language',
        id: 'non-existent-id',
      });
    });

    it('should delete the language', async () => {
      await repo(Language).save({ id: 'lang-1' });

      await request(app.getHttpServer()).delete('/language/lang-1').expect(200);

      const found = await repo(Language).findOne({ where: { id: 'lang-1' } });
      expect(found).toBeNull();
    });
  });
});
