import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { DataSource, Repository, EntityTarget } from 'typeorm';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';
import { FormController } from './form.controller';
import { Form } from '../entities/form/form.entity';
import { Attribute } from '../../settings/entities/attribute/attribute.entity';
import { Group } from '../../personal/entities/group/group.entity';
import { Form4Permission } from '../entities/form/form4permission.entity';
import { TestDbModule } from '../../tests/test-db.module';
import { ExceptionModule } from '../../exception/exception.module';
import { CommonModule } from '../../common/common.module';
import { PermissionMethod } from '../../common/permission/permission.method';

const JWT_SECRET = 'test-secret';

describe('FormController', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let jwtService: JwtService;
  let repo: <T>(target: EntityTarget<T>) => Repository<T>;

  beforeAll(() => {
    process.env.JWT_SECRET = JWT_SECRET;
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TestDbModule,
        ExceptionModule,
        CommonModule,
        TypeOrmModule.forFeature([Form]),
        JwtModule.register({ secret: JWT_SECRET }),
      ],
      controllers: [FormController],
      providers: [],
    }).compile();

    app = module.createNestApplication();
    app.use(cookieParser());
    dataSource = module.get<DataSource>(DataSource);
    jwtService = module.get<JwtService>(JwtService);
    await app.init();

    repo = dataSource.getRepository.bind(dataSource);

    // Create admin group for permission service
    await repo(Group).save({ id: 'admin' });
  });

  afterEach(() => app.close());

  describe('GET /form', () => {
    it('should return an empty array when no forms exist', async () => {
      const response = await request(app.getHttpServer())
        .get('/form')
        .expect(200);

      expect(response.body).toEqual({ data: [], count: 0 });
    });

    it('should return an array of forms with relations', async () => {
      await repo(Form).save({ id: 'form-1' });
      await repo(Form4Permission).save({
        parentId: 'form-1',
        method: PermissionMethod.READ,
      });

      const response = await request(app.getHttpServer())
        .get('/form')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].id).toBe('form-1');
      expect(response.body.data[0].attributes).toEqual({
        strings: [],
        points: [],
        descriptions: [],
        files: [],
        counters: [],
      });
      expect(response.body.data[0].permissions).toHaveLength(1);
    });

    it('should filter out forms without READ permission', async () => {
      await repo(Form).save({ id: 'form-1' });
      await repo(Form).save({ id: 'form-2' });
      await repo(Form).save({ id: 'form-3' });
      await repo(Form4Permission).save({
        parentId: 'form-1',
        method: PermissionMethod.READ,
      });
      await repo(Form4Permission).save({
        parentId: 'form-3',
        method: PermissionMethod.READ,
      });

      const response = await request(app.getHttpServer())
        .get('/form')
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.data.map((f) => f.id)).toEqual(['form-1', 'form-3']);
    });

    it('should return forms with group permission when user has matching group in token', async () => {
      await repo(Group).save({ id: 'admins' });
      await repo(Form).save({ id: 'form-1' });
      await repo(Form).save({ id: 'form-2' });
      await repo(Form4Permission).save({
        parentId: 'form-1',
        groupId: 'admins',
        method: PermissionMethod.READ,
      });
      await repo(Form4Permission).save({
        parentId: 'form-2',
        method: PermissionMethod.READ,
      });

      const token = jwtService.sign({ sub: 'user-1', groups: ['admins'] });

      const response = await request(app.getHttpServer())
        .get('/form')
        .set('Cookie', `auth_token=${token}`)
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.data.map((f) => f.id)).toEqual(['form-1', 'form-2']);
    });

    it('should not return forms with group permission when user lacks that group', async () => {
      await repo(Group).save({ id: 'admins' });
      await repo(Form).save({ id: 'form-1' });
      await repo(Form).save({ id: 'form-2' });
      await repo(Form4Permission).save({
        parentId: 'form-1',
        groupId: 'admins',
        method: PermissionMethod.READ,
      });
      await repo(Form4Permission).save({
        parentId: 'form-2',
        method: PermissionMethod.READ,
      });

      const token = jwtService.sign({ sub: 'user-1', groups: ['users'] });

      const response = await request(app.getHttpServer())
        .get('/form')
        .set('Cookie', `auth_token=${token}`)
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].id).toBe('form-2');
    });
  });

  describe('GET /form with pagination', () => {
    it('should return limited forms when limit is provided', async () => {
      await repo(Form).save({ id: 'form-1' });
      await repo(Form).save({ id: 'form-2' });
      await repo(Form).save({ id: 'form-3' });
      await repo(Form4Permission).save({
        parentId: 'form-1',
        method: PermissionMethod.READ,
      });
      await repo(Form4Permission).save({
        parentId: 'form-2',
        method: PermissionMethod.READ,
      });
      await repo(Form4Permission).save({
        parentId: 'form-3',
        method: PermissionMethod.READ,
      });

      const response = await request(app.getHttpServer())
        .get('/form?limit=2')
        .expect(200);

      expect(response.body.data).toHaveLength(2);
    });

    it('should skip forms when offset is provided', async () => {
      await repo(Form).save({ id: 'form-1' });
      await repo(Form).save({ id: 'form-2' });
      await repo(Form).save({ id: 'form-3' });
      await repo(Form4Permission).save({
        parentId: 'form-1',
        method: PermissionMethod.READ,
      });
      await repo(Form4Permission).save({
        parentId: 'form-2',
        method: PermissionMethod.READ,
      });
      await repo(Form4Permission).save({
        parentId: 'form-3',
        method: PermissionMethod.READ,
      });

      const response = await request(app.getHttpServer())
        .get('/form?offset=1')
        .expect(200);

      expect(response.body.data).toHaveLength(2);
    });

    it('should return paginated forms when both limit and offset are provided', async () => {
      await repo(Form).save({ id: 'form-1' });
      await repo(Form).save({ id: 'form-2' });
      await repo(Form).save({ id: 'form-3' });
      await repo(Form).save({ id: 'form-4' });
      await repo(Form4Permission).save({
        parentId: 'form-1',
        method: PermissionMethod.READ,
      });
      await repo(Form4Permission).save({
        parentId: 'form-2',
        method: PermissionMethod.READ,
      });
      await repo(Form4Permission).save({
        parentId: 'form-3',
        method: PermissionMethod.READ,
      });
      await repo(Form4Permission).save({
        parentId: 'form-4',
        method: PermissionMethod.READ,
      });

      const response = await request(app.getHttpServer())
        .get('/form?limit=2&offset=1')
        .expect(200);

      expect(response.body.data).toHaveLength(2);
    });

    it('should return empty array when offset exceeds total forms', async () => {
      await repo(Form).save({ id: 'form-1' });
      await repo(Form4Permission).save({
        parentId: 'form-1',
        method: PermissionMethod.READ,
      });

      const response = await request(app.getHttpServer())
        .get('/form?offset=10')
        .expect(200);

      expect(response.body.data).toEqual([]);
    });
  });

  describe('GET /form/:id', () => {
    it('should return 404 for non-existent form', async () => {
      const response = await request(app.getHttpServer())
        .get('/form/non-existent-id')
        .expect(404);

      expect(response.body.message).toBe(
        'Form with id non-existent-id not found',
      );
      expect(response.body.details).toEqual({
        entity: 'Form',
        id: 'non-existent-id',
      });
    });

    it('should return a single form with relations', async () => {
      await repo(Form).save({ id: 'form-1' });
      await repo(Form4Permission).save({
        parentId: 'form-1',
        method: PermissionMethod.READ,
      });

      const response = await request(app.getHttpServer())
        .get('/form/form-1')
        .expect(200);

      expect(response.body.id).toBe('form-1');
      expect(response.body.attributes).toEqual({
        strings: [],
        points: [],
        descriptions: [],
        files: [],
        counters: [],
      });
      expect(response.body.permissions).toHaveLength(1);
    });

    it('should return 403 when no READ permission exists', async () => {
      await repo(Form).save({ id: 'form-1' });

      const response = await request(app.getHttpServer())
        .get('/form/form-1')
        .expect(403);

      expect(response.body.message).toBe(
        'Permission denied: READ on Form with id form-1',
      );
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
        files: [],
        counters: [],
      });

      const found = await repo(Form).findOne({ where: { id: 'new-form' } });
      expect(found).not.toBeNull();
    });

    it('should create form with strings', async () => {
      await repo(Attribute).save({ id: 'name' });

      const response = await request(app.getHttpServer())
        .post('/form')
        .send({
          id: 'new-form',
          strings: [{ attr: 'name', value: 'Test Form' }],
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
      await repo(Attribute).save({ id: 'content' });

      const response = await request(app.getHttpServer())
        .post('/form')
        .send({
          id: 'new-form',
          descriptions: [{ attr: 'content', value: 'Long description text' }],
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
      await repo(Group).save({ id: 'admins' });

      const response = await request(app.getHttpServer())
        .post('/form')
        .send({
          id: 'new-form',
          permissions: [
            { parentId: 'new-form', groupId: 'admins', method: 'READ' },
          ],
        })
        .expect(201);

      expect(response.body.id).toBe('new-form');
      expect(response.body.permissions).toHaveLength(2);
      expect(response.body.permissions).toContainEqual({
        group: 'admins',
        method: 'READ',
      });
      expect(response.body.permissions).toContainEqual({
        group: 'admin',
        method: 'ALL',
      });
    });

    it('should return 400 when id is empty string', async () => {
      const response = await request(app.getHttpServer())
        .post('/form')
        .send({ id: '' })
        .expect(400);

      expect(response.body.message).toBe('Database query failed');
    });
  });

  describe('PUT /form/:id', () => {
    it('should return 404 for non-existent form', async () => {
      const response = await request(app.getHttpServer())
        .put('/form/non-existent-id')
        .send({})
        .expect(404);

      expect(response.body.message).toBe(
        'Form with id non-existent-id not found',
      );
      expect(response.body.details).toEqual({
        entity: 'Form',
        id: 'non-existent-id',
      });
    });

    it('should update and return the form', async () => {
      await repo(Form).save({ id: 'form-1' });
      await repo(Form4Permission).save({
        parentId: 'form-1',
        method: PermissionMethod.WRITE,
      });

      const response = await request(app.getHttpServer())
        .put('/form/form-1')
        .send({})
        .expect(200);

      expect(response.body.id).toBe('form-1');
    });

    it('should return 403 when no WRITE permission exists', async () => {
      await repo(Form).save({ id: 'form-1' });

      const response = await request(app.getHttpServer())
        .put('/form/form-1')
        .send({})
        .expect(403);

      expect(response.body.message).toBe(
        'Permission denied: WRITE on Form with id form-1',
      );
    });

    it('should add new permissions without removing existing ones', async () => {
      await repo(Group).save({ id: 'admins' });
      await repo(Group).save({ id: 'editors' });
      await repo(Form).save({ id: 'form-1' });
      await repo(Form4Permission).save({
        parentId: 'form-1',
        groupId: 'admins',
        method: PermissionMethod.READ,
      });
      await repo(Form4Permission).save({
        parentId: 'form-1',
        method: PermissionMethod.WRITE,
      });

      const response = await request(app.getHttpServer())
        .put('/form/form-1')
        .send({
          permissions: [
            { parentId: 'form-1', groupId: 'admins', method: 'READ' },
            { parentId: 'form-1', groupId: 'editors', method: 'READ' },
          ],
        })
        .expect(200);

      expect(response.body.permissions).toHaveLength(3);
      expect(response.body.permissions).toContainEqual({
        group: 'admins',
        method: 'READ',
      });
      expect(response.body.permissions).toContainEqual({
        group: 'editors',
        method: 'READ',
      });
      expect(response.body.permissions).toContainEqual({
        group: 'admin',
        method: 'ALL',
      });
    });

    it('should remove permissions that are no longer in the list', async () => {
      await repo(Group).save({ id: 'admins' });
      await repo(Group).save({ id: 'editors' });
      await repo(Form).save({ id: 'form-1' });
      await repo(Form4Permission).save({
        parentId: 'form-1',
        groupId: 'admins',
        method: PermissionMethod.READ,
      });
      await repo(Form4Permission).save({
        parentId: 'form-1',
        groupId: 'editors',
        method: PermissionMethod.READ,
      });
      await repo(Form4Permission).save({
        parentId: 'form-1',
        method: PermissionMethod.WRITE,
      });

      const response = await request(app.getHttpServer())
        .put('/form/form-1')
        .send({
          permissions: [
            { parentId: 'form-1', groupId: 'admins', method: 'READ' },
          ],
        })
        .expect(200);

      expect(response.body.permissions).toHaveLength(2);
      expect(response.body.permissions).toContainEqual({
        group: 'admins',
        method: 'READ',
      });
      expect(response.body.permissions).toContainEqual({
        group: 'admin',
        method: 'ALL',
      });
    });

    it('should keep existing permissions unchanged when same permissions are sent', async () => {
      await repo(Group).save({ id: 'admins' });
      await repo(Form).save({ id: 'form-1' });
      const existingPerm = await repo(Form4Permission).save({
        parentId: 'form-1',
        groupId: 'admins',
        method: PermissionMethod.READ,
      });
      await repo(Form4Permission).save({
        parentId: 'form-1',
        method: PermissionMethod.WRITE,
      });

      const response = await request(app.getHttpServer())
        .put('/form/form-1')
        .send({
          permissions: [
            { parentId: 'form-1', groupId: 'admins', method: 'READ' },
          ],
        })
        .expect(200);

      expect(response.body.permissions).toHaveLength(2);
      expect(response.body.permissions).toContainEqual({
        group: 'admins',
        method: 'READ',
      });
      expect(response.body.permissions).toContainEqual({
        group: 'admin',
        method: 'ALL',
      });

      const permAfter = await repo(Form4Permission).findOne({
        where: {
          parentId: 'form-1',
          groupId: 'admins',
          method: PermissionMethod.READ,
        },
      });
      expect(permAfter.id).toBe(existingPerm.id);
    });
  });

  describe('DELETE /form/:id', () => {
    it('should return 404 for non-existent form', async () => {
      const response = await request(app.getHttpServer())
        .delete('/form/non-existent-id')
        .expect(404);

      expect(response.body.message).toBe(
        'Form with id non-existent-id not found',
      );
      expect(response.body.details).toEqual({
        entity: 'Form',
        id: 'non-existent-id',
      });
    });

    it('should delete the form', async () => {
      await repo(Form).save({ id: 'form-1' });
      await repo(Form4Permission).save({
        parentId: 'form-1',
        method: PermissionMethod.DELETE,
      });

      await request(app.getHttpServer()).delete('/form/form-1').expect(200);

      const found = await repo(Form).findOne({ where: { id: 'form-1' } });
      expect(found).toBeNull();
    });

    it('should return 403 when no DELETE permission exists', async () => {
      await repo(Form).save({ id: 'form-1' });

      const response = await request(app.getHttpServer())
        .delete('/form/form-1')
        .expect(403);

      expect(response.body.message).toBe(
        'Permission denied: DELETE on Form with id form-1',
      );
    });
  });
});
