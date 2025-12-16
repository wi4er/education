import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import * as request from 'supertest';
import { LanguageController } from './language.controller';
import { Language } from '../entities/language/language.entity';
import { Attribute } from '../entities/attribute/attribute.entity';
import { PointAttributeService } from '../../common/services/point-attribute.service';
import { StringAttributeService } from '../../common/services/string-attribute.service';
import { TestDbModule } from '../../tests/test-db.module';
import { ExceptionModule } from '../../exception/exception.module';

describe('LanguageController', () => {

  let app: INestApplication;
  let dataSource: DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TestDbModule,
        ExceptionModule,
        TypeOrmModule.forFeature([Language]),
      ],
      controllers: [LanguageController],
      providers: [
        PointAttributeService,
        StringAttributeService,
      ],
    }).compile();

    app = module.createNestApplication();
    dataSource = module.get<DataSource>(DataSource);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /language', () => {
    it('should return an empty array when no languages exist', async () => {
      const response = await request(app.getHttpServer())
        .get('/language')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return an array of languages with relations', async () => {
      const repo = dataSource.getRepository(Language);
      await repo.save(repo.create({ id: 'lang-1' }));

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

  describe('GET /language/:id', () => {
    it('should return 404 for non-existent language', async () => {
      const response = await request(app.getHttpServer())
        .get('/language/non-existent-id')
        .expect(404);

      expect(response.body.message).toBe('Language with id non-existent-id not found');
      expect(response.body.details).toEqual({
        entity: 'Language',
        id: 'non-existent-id',
      });
    });

    it('should return a single language with relations', async () => {
      const repo = dataSource.getRepository(Language);
      await repo.save(repo.create({ id: 'lang-1' }));

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

      const repo = dataSource.getRepository(Language);
      const found = await repo.findOne({ where: { id: 'new-lang' } });
      expect(found).not.toBeNull();
    });

    it('should create language with strings', async () => {
      const attrRepo = dataSource.getRepository(Attribute);
      await attrRepo.save(attrRepo.create({ id: 'name' }));

      const response = await request(app.getHttpServer())
        .post('/language')
        .send({
          id: 'new-lang',
          strings: [{ parentId: 'new-lang', attributeId: 'name', value: 'English' }],
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

      expect(response.body.message).toBe('Language with id non-existent-id not found');
      expect(response.body.details).toEqual({
        entity: 'Language',
        id: 'non-existent-id',
      });
    });

    it('should update and return the language', async () => {
      const repo = dataSource.getRepository(Language);
      await repo.save(repo.create({ id: 'lang-1' }));

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

      expect(response.body.message).toBe('Language with id non-existent-id not found');
      expect(response.body.details).toEqual({
        entity: 'Language',
        id: 'non-existent-id',
      });
    });

    it('should delete the language', async () => {
      const repo = dataSource.getRepository(Language);
      await repo.save(repo.create({ id: 'lang-1' }));

      await request(app.getHttpServer())
        .delete('/language/lang-1')
        .expect(200);

      const found = await repo.findOne({ where: { id: 'lang-1' } });
      expect(found).toBeNull();
    });
  });

});
