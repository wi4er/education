import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import * as request from 'supertest';
import { FormController } from './form.controller';
import { Form } from '../entities/form/form.entity';
import { Attribute } from '../../settings/entities/attribute/attribute.entity';
import { Group } from '../../personal/entities/group/group.entity';
import { PointAttributeService } from '../../common/services/point-attribute.service';
import { StringAttributeService } from '../../common/services/string-attribute.service';
import { PermissionAttributeService } from '../../common/services/permission-attribute.service';
import { DescriptionAttributeService } from '../../common/services/description-attribute.service';
import { TestDbModule } from '../../tests/test-db.module';
import { ExceptionModule } from '../../exception/exception.module';

describe('FormController', () => {

  let app: INestApplication;
  let dataSource: DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TestDbModule,
        ExceptionModule,
        TypeOrmModule.forFeature([Form]),
      ],
      controllers: [FormController],
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

  describe('GET /form', () => {
    it('should return an empty array when no forms exist', async () => {
      const response = await request(app.getHttpServer())
        .get('/form')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return an array of forms with relations', async () => {
      const repo = dataSource.getRepository(Form);
      await repo.save(repo.create({ id: 'form-1' }));

      const response = await request(app.getHttpServer())
        .get('/form')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].id).toBe('form-1');
      expect(response.body[0].attributes).toEqual({
        strings: [],
        points: [],
        descriptions: [],
      });
      expect(response.body[0].permissions).toEqual([]);
    });
  });

  describe('GET /form/:id', () => {
    it('should return 404 for non-existent form', async () => {
      const response = await request(app.getHttpServer())
        .get('/form/non-existent-id')
        .expect(404);

      expect(response.body.message).toBe('Form with id non-existent-id not found');
      expect(response.body.details).toEqual({
        entity: 'Form',
        id: 'non-existent-id',
      });
    });

    it('should return a single form with relations', async () => {
      const repo = dataSource.getRepository(Form);
      await repo.save(repo.create({ id: 'form-1' }));

      const response = await request(app.getHttpServer())
        .get('/form/form-1')
        .expect(200);

      expect(response.body.id).toBe('form-1');
      expect(response.body.attributes).toEqual({
        strings: [],
        points: [],
        descriptions: [],
      });
      expect(response.body.permissions).toEqual([]);
    });
  });

  describe('POST /form', () => {
    it('should create and return a new form', async () => {
      const response = await request(app.getHttpServer())
        .post('/form')
        .send({ id: 'new-form' })
        .expect(201);

      expect(response.body.id).toBe('new-form');
      expect(response.body.attributes).toEqual({
        strings: [],
        points: [],
        descriptions: [],
      });

      const repo = dataSource.getRepository(Form);
      const found = await repo.findOne({ where: { id: 'new-form' } });
      expect(found).not.toBeNull();
    });

    it('should create form with strings', async () => {
      const attrRepo = dataSource.getRepository(Attribute);
      await attrRepo.save(attrRepo.create({ id: 'name' }));

      const response = await request(app.getHttpServer())
        .post('/form')
        .send({
          id: 'new-form',
          strings: [{ parentId: 'new-form', attributeId: 'name', value: 'Test Form' }],
        })
        .expect(201);

      expect(response.body.id).toBe('new-form');
      expect(response.body.attributes.strings).toHaveLength(1);
      expect(response.body.attributes.strings[0]).toEqual({
        lang: null,
        attr: 'name',
        value: 'Test Form',
      });
    });

    it('should create form with descriptions', async () => {
      const attrRepo = dataSource.getRepository(Attribute);
      await attrRepo.save(attrRepo.create({ id: 'content' }));

      const response = await request(app.getHttpServer())
        .post('/form')
        .send({
          id: 'new-form',
          descriptions: [{ parentId: 'new-form', attributeId: 'content', value: 'Long description text' }],
        })
        .expect(201);

      expect(response.body.id).toBe('new-form');
      expect(response.body.attributes.descriptions).toHaveLength(1);
      expect(response.body.attributes.descriptions[0]).toEqual({
        lang: null,
        attr: 'content',
        value: 'Long description text',
      });
    });

    it('should create form with permissions', async () => {
      const groupRepo = dataSource.getRepository(Group);
      await groupRepo.save(groupRepo.create({ id: 'admins' }));

      const response = await request(app.getHttpServer())
        .post('/form')
        .send({
          id: 'new-form',
          permissions: [{ parentId: 'new-form', groupId: 'admins', method: 'READ' }],
        })
        .expect(201);

      expect(response.body.id).toBe('new-form');
      expect(response.body.permissions).toHaveLength(1);
      expect(response.body.permissions[0]).toEqual({
        group: 'admins',
        method: 'READ',
      });
    });
  });

  describe('PUT /form/:id', () => {
    it('should return 404 for non-existent form', async () => {
      const response = await request(app.getHttpServer())
        .put('/form/non-existent-id')
        .send({})
        .expect(404);

      expect(response.body.message).toBe('Form with id non-existent-id not found');
      expect(response.body.details).toEqual({
        entity: 'Form',
        id: 'non-existent-id',
      });
    });

    it('should update and return the form', async () => {
      const repo = dataSource.getRepository(Form);
      await repo.save(repo.create({ id: 'form-1' }));

      const response = await request(app.getHttpServer())
        .put('/form/form-1')
        .send({})
        .expect(200);

      expect(response.body.id).toBe('form-1');
    });
  });

  describe('DELETE /form/:id', () => {
    it('should return 404 for non-existent form', async () => {
      const response = await request(app.getHttpServer())
        .delete('/form/non-existent-id')
        .expect(404);

      expect(response.body.message).toBe('Form with id non-existent-id not found');
      expect(response.body.details).toEqual({
        entity: 'Form',
        id: 'non-existent-id',
      });
    });

    it('should delete the form', async () => {
      const repo = dataSource.getRepository(Form);
      await repo.save(repo.create({ id: 'form-1' }));

      await request(app.getHttpServer())
        .delete('/form/form-1')
        .expect(200);

      const found = await repo.findOne({ where: { id: 'form-1' } });
      expect(found).toBeNull();
    });
  });

});
