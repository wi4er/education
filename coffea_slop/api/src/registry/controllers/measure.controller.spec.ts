import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import * as request from 'supertest';
import { MeasureController } from './measure.controller';
import { Measure } from '../entities/measure/measure.entity';
import { Attribute } from '../../settings/entities/attribute/attribute.entity';
import { PointAttributeService } from '../../common/services/point-attribute.service';
import { StringAttributeService } from '../../common/services/string-attribute.service';
import { TestDbModule } from '../../tests/test-db.module';
import { ExceptionModule } from '../../exception/exception.module';
import { CommonModule } from '../../common/common.module';

describe('MeasureController', () => {

  let app: INestApplication;
  let dataSource: DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TestDbModule,
        ExceptionModule,
        CommonModule,
        TypeOrmModule.forFeature([Measure]),
      ],
      controllers: [MeasureController],
      providers: [],
    }).compile();

    app = module.createNestApplication();
    dataSource = module.get<DataSource>(DataSource);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /measure', () => {
    it('should return an empty array when no measures exist', async () => {
      const response = await request(app.getHttpServer())
        .get('/measure')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return an array of measures with relations', async () => {
      const repo = dataSource.getRepository(Measure);
      await repo.save(repo.create({ id: 'measure-1' }));

      const response = await request(app.getHttpServer())
        .get('/measure')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].id).toBe('measure-1');
      expect(response.body[0].attributes).toEqual({
        strings: [],
        points: [],
      });
    });
  });

  describe('GET /measure with pagination', () => {
    it('should return limited measures when limit is provided', async () => {
      await dataSource.getRepository(Measure).save({ id: 'measure-1' });
      await dataSource.getRepository(Measure).save({ id: 'measure-2' });
      await dataSource.getRepository(Measure).save({ id: 'measure-3' });

      const response = await request(app.getHttpServer())
        .get('/measure?limit=2')
        .expect(200);

      expect(response.body).toHaveLength(2);
    });

    it('should skip measures when offset is provided', async () => {
      await dataSource.getRepository(Measure).save({ id: 'measure-1' });
      await dataSource.getRepository(Measure).save({ id: 'measure-2' });
      await dataSource.getRepository(Measure).save({ id: 'measure-3' });

      const response = await request(app.getHttpServer())
        .get('/measure?offset=1')
        .expect(200);

      expect(response.body).toHaveLength(2);
    });

    it('should return paginated measures when both limit and offset are provided', async () => {
      await dataSource.getRepository(Measure).save({ id: 'measure-1' });
      await dataSource.getRepository(Measure).save({ id: 'measure-2' });
      await dataSource.getRepository(Measure).save({ id: 'measure-3' });
      await dataSource.getRepository(Measure).save({ id: 'measure-4' });

      const response = await request(app.getHttpServer())
        .get('/measure?limit=2&offset=1')
        .expect(200);

      expect(response.body).toHaveLength(2);
    });

    it('should return empty array when offset exceeds total measures', async () => {
      await dataSource.getRepository(Measure).save({ id: 'measure-1' });

      const response = await request(app.getHttpServer())
        .get('/measure?offset=10')
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });

  describe('GET /measure/:id', () => {
    it('should return 404 for non-existent measure', async () => {
      const response = await request(app.getHttpServer())
        .get('/measure/non-existent-id')
        .expect(404);

      expect(response.body.message).toBe('Measure with id non-existent-id not found');
      expect(response.body.details).toEqual({
        entity: 'Measure',
        id: 'non-existent-id',
      });
    });

    it('should return a single measure with relations', async () => {
      const repo = dataSource.getRepository(Measure);
      await repo.save(repo.create({ id: 'measure-1' }));

      const response = await request(app.getHttpServer())
        .get('/measure/measure-1')
        .expect(200);

      expect(response.body.id).toBe('measure-1');
      expect(response.body.attributes).toEqual({
        strings: [],
        points: [],
      });
    });
  });

  describe('POST /measure', () => {
    it('should create and return a new measure', async () => {
      const response = await request(app.getHttpServer())
        .post('/measure')
        .send({ id: 'new-measure' })
        .expect(201);

      expect(response.body.id).toBe('new-measure');
      expect(response.body.attributes).toEqual({
        strings: [],
        points: [],
      });

      const repo = dataSource.getRepository(Measure);
      const found = await repo.findOne({ where: { id: 'new-measure' } });
      expect(found).not.toBeNull();
    });

    it('should create measure with strings', async () => {
      const attrRepo = dataSource.getRepository(Attribute);
      await attrRepo.save(attrRepo.create({ id: 'name' }));

      const response = await request(app.getHttpServer())
        .post('/measure')
        .send({
          id: 'new-measure',
          strings: [{ attr: 'name', value: 'Kilogram' }],
        })
        .expect(201);

      expect(response.body.id).toBe('new-measure');
      expect(response.body.attributes.strings).toHaveLength(1);
      expect(response.body.attributes.strings[0]).toEqual({
        lang: null,
        attr: 'name',
        value: 'Kilogram',
      });
    });
  });

  describe('PUT /measure/:id', () => {
    it('should return 404 for non-existent measure', async () => {
      const response = await request(app.getHttpServer())
        .put('/measure/non-existent-id')
        .send({})
        .expect(404);

      expect(response.body.message).toBe('Measure with id non-existent-id not found');
      expect(response.body.details).toEqual({
        entity: 'Measure',
        id: 'non-existent-id',
      });
    });

    it('should update and return the measure', async () => {
      const repo = dataSource.getRepository(Measure);
      await repo.save(repo.create({ id: 'measure-1' }));

      const response = await request(app.getHttpServer())
        .put('/measure/measure-1')
        .send({})
        .expect(200);

      expect(response.body.id).toBe('measure-1');
    });
  });

  describe('DELETE /measure/:id', () => {
    it('should return 404 for non-existent measure', async () => {
      const response = await request(app.getHttpServer())
        .delete('/measure/non-existent-id')
        .expect(404);

      expect(response.body.message).toBe('Measure with id non-existent-id not found');
      expect(response.body.details).toEqual({
        entity: 'Measure',
        id: 'non-existent-id',
      });
    });

    it('should delete the measure', async () => {
      const repo = dataSource.getRepository(Measure);
      await repo.save(repo.create({ id: 'measure-1' }));

      await request(app.getHttpServer())
        .delete('/measure/measure-1')
        .expect(200);

      const found = await repo.findOne({ where: { id: 'measure-1' } });
      expect(found).toBeNull();
    });
  });

});
