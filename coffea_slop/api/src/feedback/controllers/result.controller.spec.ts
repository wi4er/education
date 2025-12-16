import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import * as request from 'supertest';
import { ResultController } from './result.controller';
import { Result } from '../entities/result/result.entity';
import { Form } from '../entities/form/form.entity';
import { TestDbModule } from '../../tests/test-db.module';
import { ExceptionModule } from '../../exception/exception.module';

describe('ResultController', () => {

  let app: INestApplication;
  let dataSource: DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TestDbModule,
        ExceptionModule,
        TypeOrmModule.forFeature([Result]),
      ],
      controllers: [ResultController],
    }).compile();

    app = module.createNestApplication();
    dataSource = module.get<DataSource>(DataSource);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /result', () => {
    it('should return an empty array when no results exist', async () => {
      const response = await request(app.getHttpServer())
        .get('/result')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return an array of results', async () => {
      const formRepo = dataSource.getRepository(Form);
      await formRepo.save(formRepo.create({ id: 'form-1' }));

      const repo = dataSource.getRepository(Result);
      await repo.save(repo.create({ id: 'result-1', formId: 'form-1' }));

      const response = await request(app.getHttpServer())
        .get('/result')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].id).toBe('result-1');
      expect(response.body[0].formId).toBe('form-1');
    });
  });

  describe('GET /result/:id', () => {
    it('should return 404 for non-existent result', async () => {
      const response = await request(app.getHttpServer())
        .get('/result/non-existent-id')
        .expect(404);

      expect(response.body.message).toBe('Result with id non-existent-id not found');
      expect(response.body.details).toEqual({
        entity: 'Result',
        id: 'non-existent-id',
      });
    });

    it('should return a single result', async () => {
      const formRepo = dataSource.getRepository(Form);
      await formRepo.save(formRepo.create({ id: 'form-1' }));

      const repo = dataSource.getRepository(Result);
      await repo.save(repo.create({ id: 'result-1', formId: 'form-1' }));

      const response = await request(app.getHttpServer())
        .get('/result/result-1')
        .expect(200);

      expect(response.body.id).toBe('result-1');
      expect(response.body.formId).toBe('form-1');
    });
  });

  describe('POST /result', () => {
    it('should create and return a new result', async () => {
      const formRepo = dataSource.getRepository(Form);
      await formRepo.save(formRepo.create({ id: 'form-1' }));

      const response = await request(app.getHttpServer())
        .post('/result')
        .send({ id: 'new-result', formId: 'form-1' })
        .expect(201);

      expect(response.body.id).toBe('new-result');
      expect(response.body.formId).toBe('form-1');

      const repo = dataSource.getRepository(Result);
      const found = await repo.findOne({ where: { id: 'new-result' } });
      expect(found).not.toBeNull();
    });
  });

  describe('PUT /result/:id', () => {
    it('should return 404 for non-existent result', async () => {
      const response = await request(app.getHttpServer())
        .put('/result/non-existent-id')
        .send({ formId: 'form-1' })
        .expect(404);

      expect(response.body.message).toBe('Result with id non-existent-id not found');
      expect(response.body.details).toEqual({
        entity: 'Result',
        id: 'non-existent-id',
      });
    });

    it('should update and return the result', async () => {
      const formRepo = dataSource.getRepository(Form);
      await formRepo.save(formRepo.create({ id: 'form-1' }));
      await formRepo.save(formRepo.create({ id: 'form-2' }));

      const repo = dataSource.getRepository(Result);
      await repo.save(repo.create({ id: 'result-1', formId: 'form-1' }));

      const response = await request(app.getHttpServer())
        .put('/result/result-1')
        .send({ formId: 'form-2' })
        .expect(200);

      expect(response.body.id).toBe('result-1');
      expect(response.body.formId).toBe('form-2');
    });
  });

  describe('DELETE /result/:id', () => {
    it('should return 404 for non-existent result', async () => {
      const response = await request(app.getHttpServer())
        .delete('/result/non-existent-id')
        .expect(404);

      expect(response.body.message).toBe('Result with id non-existent-id not found');
      expect(response.body.details).toEqual({
        entity: 'Result',
        id: 'non-existent-id',
      });
    });

    it('should delete the result', async () => {
      const formRepo = dataSource.getRepository(Form);
      await formRepo.save(formRepo.create({ id: 'form-1' }));

      const repo = dataSource.getRepository(Result);
      await repo.save(repo.create({ id: 'result-1', formId: 'form-1' }));

      await request(app.getHttpServer())
        .delete('/result/result-1')
        .expect(200);

      const found = await repo.findOne({ where: { id: 'result-1' } });
      expect(found).toBeNull();
    });
  });

});
