import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';
import { DirectoryController } from './directory.controller';
import { Directory } from '../entities/directory/directory.entity';
import { Attribute } from '../../settings/entities/attribute/attribute.entity';
import { Group } from '../../personal/entities/group/group.entity';
import { Directory4Permission } from '../entities/directory/directory4permission.entity';
import { TestDbModule } from '../../tests/test-db.module';
import { ExceptionModule } from '../../exception/exception.module';
import { CommonModule } from '../../common/common.module';
import { PermissionMethod } from '../../common/permission/permission.method';

const JWT_SECRET = 'test-secret';

describe('DirectoryController', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let jwtService: JwtService;
  let repo;

  beforeAll(() => {
    process.env.JWT_SECRET = JWT_SECRET;
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TestDbModule,
        ExceptionModule,
        CommonModule,
        TypeOrmModule.forFeature([Directory]),
        JwtModule.register({ secret: JWT_SECRET }),
      ],
      controllers: [DirectoryController],
      providers: [],
    }).compile();

    app = module.createNestApplication();
    app.use(cookieParser());
    dataSource = module.get<DataSource>(DataSource);
    jwtService = module.get<JwtService>(JwtService);
    await app.init();

    repo = dataSource.getRepository.bind(dataSource);

    await repo(Group).save({ id: 'admin' });
  });

  afterEach(() => app.close());

  describe('GET /directory', () => {
    it('should return an empty array when no directories exist', async () => {
      const response = await request(app.getHttpServer())
        .get('/directory')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return an array of directories with relations', async () => {
      await repo(Directory).save({ id: 'dir-1' });
      await repo(Directory4Permission).save({ parentId: 'dir-1', method: PermissionMethod.READ });

      const response = await request(app.getHttpServer())
        .get('/directory')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].id).toBe('dir-1');
      expect(response.body[0].attributes).toEqual({
        strings: [],
        points: [],
      });
      expect(response.body[0].permissions).toHaveLength(1);
    });

    it('should filter out directories without READ permission', async () => {
      await repo(Directory).save({ id: 'dir-1' });
      await repo(Directory).save({ id: 'dir-2' });
      await repo(Directory).save({ id: 'dir-3' });
      await repo(Directory4Permission).save({ parentId: 'dir-1', method: PermissionMethod.READ });
      await repo(Directory4Permission).save({ parentId: 'dir-3', method: PermissionMethod.READ });

      const response = await request(app.getHttpServer())
        .get('/directory')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body.map(d => d.id)).toEqual(['dir-1', 'dir-3']);
    });

    it('should return directories with group permission when user has matching group in token', async () => {
      await repo(Group).save({ id: 'admins' });
      await repo(Directory).save({ id: 'dir-1' });
      await repo(Directory).save({ id: 'dir-2' });
      await repo(Directory4Permission).save({
        parentId: 'dir-1',
        groupId: 'admins',
        method: PermissionMethod.READ,
      });
      await repo(Directory4Permission).save({ parentId: 'dir-2', method: PermissionMethod.READ });

      const token = jwtService.sign({ sub: 'user-1', groups: ['admins'] });

      const response = await request(app.getHttpServer())
        .get('/directory')
        .set('Cookie', `auth_token=${token}`)
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body.map(d => d.id)).toEqual(['dir-1', 'dir-2']);
    });

    it('should not return directories with group permission when user lacks that group', async () => {
      await repo(Group).save({ id: 'admins' });
      await repo(Directory).save({ id: 'dir-1' });
      await repo(Directory).save({ id: 'dir-2' });
      await repo(Directory4Permission).save({
        parentId: 'dir-1',
        groupId: 'admins',
        method: PermissionMethod.READ,
      });
      await repo(Directory4Permission).save({ parentId: 'dir-2', method: PermissionMethod.READ });

      const token = jwtService.sign({ sub: 'user-1', groups: ['users'] });

      const response = await request(app.getHttpServer())
        .get('/directory')
        .set('Cookie', `auth_token=${token}`)
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].id).toBe('dir-2');
    });
  });

  describe('GET /directory with pagination', () => {
    it('should return limited directories when limit is provided', async () => {
      await repo(Directory).save({ id: 'dir-1' });
      await repo(Directory).save({ id: 'dir-2' });
      await repo(Directory).save({ id: 'dir-3' });
      await repo(Directory4Permission).save({ parentId: 'dir-1', method: PermissionMethod.READ });
      await repo(Directory4Permission).save({ parentId: 'dir-2', method: PermissionMethod.READ });
      await repo(Directory4Permission).save({ parentId: 'dir-3', method: PermissionMethod.READ });

      const response = await request(app.getHttpServer())
        .get('/directory?limit=2')
        .expect(200);

      expect(response.body).toHaveLength(2);
    });

    it('should skip directories when offset is provided', async () => {
      await repo(Directory).save({ id: 'dir-1' });
      await repo(Directory).save({ id: 'dir-2' });
      await repo(Directory).save({ id: 'dir-3' });
      await repo(Directory4Permission).save({ parentId: 'dir-1', method: PermissionMethod.READ });
      await repo(Directory4Permission).save({ parentId: 'dir-2', method: PermissionMethod.READ });
      await repo(Directory4Permission).save({ parentId: 'dir-3', method: PermissionMethod.READ });

      const response = await request(app.getHttpServer())
        .get('/directory?offset=1')
        .expect(200);

      expect(response.body).toHaveLength(2);
    });

    it('should return paginated directories when both limit and offset are provided', async () => {
      await repo(Directory).save({ id: 'dir-1' });
      await repo(Directory).save({ id: 'dir-2' });
      await repo(Directory).save({ id: 'dir-3' });
      await repo(Directory).save({ id: 'dir-4' });
      await repo(Directory4Permission).save({ parentId: 'dir-1', method: PermissionMethod.READ });
      await repo(Directory4Permission).save({ parentId: 'dir-2', method: PermissionMethod.READ });
      await repo(Directory4Permission).save({ parentId: 'dir-3', method: PermissionMethod.READ });
      await repo(Directory4Permission).save({ parentId: 'dir-4', method: PermissionMethod.READ });

      const response = await request(app.getHttpServer())
        .get('/directory?limit=2&offset=1')
        .expect(200);

      expect(response.body).toHaveLength(2);
    });

    it('should return empty array when offset exceeds total directories', async () => {
      await repo(Directory).save({ id: 'dir-1' });
      await repo(Directory4Permission).save({ parentId: 'dir-1', method: PermissionMethod.READ });

      const response = await request(app.getHttpServer())
        .get('/directory?offset=10')
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });

  describe('GET /directory/:id', () => {
    it('should return 404 for non-existent directory', async () => {
      const response = await request(app.getHttpServer())
        .get('/directory/non-existent-id')
        .expect(404);

      expect(response.body.message).toBe(
        'Directory with id non-existent-id not found',
      );
      expect(response.body.details).toEqual({
        entity: 'Directory',
        id: 'non-existent-id',
      });
    });

    it('should return a single directory with relations', async () => {
      await repo(Directory).save({ id: 'dir-1' });
      await repo(Directory4Permission).save({ parentId: 'dir-1', method: PermissionMethod.READ });

      const response = await request(app.getHttpServer())
        .get('/directory/dir-1')
        .expect(200);

      expect(response.body.id).toBe('dir-1');
      expect(response.body.attributes).toEqual({
        strings: [],
        points: [],
      });
      expect(response.body.permissions).toHaveLength(1);
    });

    it('should return 403 when no READ permission exists', async () => {
      await repo(Directory).save({ id: 'dir-1' });

      const response = await request(app.getHttpServer())
        .get('/directory/dir-1')
        .expect(403);

      expect(response.body.message).toBe(
        'Permission denied: READ on Directory with id dir-1',
      );
    });
  });

  describe('POST /directory', () => {
    it('should create and return a new directory', async () => {
      const response = await request(app.getHttpServer())
        .post('/directory')
        .send({ id: 'new-dir' })
        .expect(201);

      expect(response.body.id).toBe('new-dir');
      expect(response.body.attributes).toEqual({
        strings: [],
        points: [],
      });

      const found = await repo(Directory).findOne({ where: { id: 'new-dir' } });
      expect(found).not.toBeNull();
    });

    it('should create directory with strings', async () => {
      await repo(Attribute).save({ id: 'name' });

      const response = await request(app.getHttpServer())
        .post('/directory')
        .send({
          id: 'new-dir',
          strings: [{ attr: 'name', value: 'Test Directory' }],
        })
        .expect(201);

      expect(response.body.id).toBe('new-dir');
      expect(response.body.attributes.strings).toHaveLength(1);
      expect(response.body.attributes.strings[0]).toEqual({
        lang: null,
        attr: 'name',
        value: 'Test Directory',
      });
    });
  });

  describe('PUT /directory/:id', () => {
    it('should return 404 for non-existent directory', async () => {
      const response = await request(app.getHttpServer())
        .put('/directory/non-existent-id')
        .send({})
        .expect(404);

      expect(response.body.message).toBe(
        'Directory with id non-existent-id not found',
      );
      expect(response.body.details).toEqual({
        entity: 'Directory',
        id: 'non-existent-id',
      });
    });

    it('should update and return the directory', async () => {
      await repo(Directory).save({ id: 'dir-1' });
      await repo(Directory4Permission).save({ parentId: 'dir-1', method: PermissionMethod.WRITE });

      const response = await request(app.getHttpServer())
        .put('/directory/dir-1')
        .send({})
        .expect(200);

      expect(response.body.id).toBe('dir-1');
    });

    it('should return 403 when no WRITE permission exists', async () => {
      await repo(Directory).save({ id: 'dir-1' });

      const response = await request(app.getHttpServer())
        .put('/directory/dir-1')
        .send({})
        .expect(403);

      expect(response.body.message).toBe(
        'Permission denied: WRITE on Directory with id dir-1',
      );
    });

    it('should add new permissions without removing existing ones', async () => {
      await repo(Group).save({ id: 'admins' });
      await repo(Group).save({ id: 'editors' });
      await repo(Directory).save({ id: 'dir-1' });
      await repo(Directory4Permission).save({
        parentId: 'dir-1',
        groupId: 'admins',
        method: PermissionMethod.READ,
      });
      await repo(Directory4Permission).save({ parentId: 'dir-1', method: PermissionMethod.WRITE });

      const response = await request(app.getHttpServer())
        .put('/directory/dir-1')
        .send({
          permissions: [
            { parentId: 'dir-1', groupId: 'admins', method: 'READ' },
            { parentId: 'dir-1', groupId: 'editors', method: 'READ' },
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
      await repo(Directory).save({ id: 'dir-1' });
      await repo(Directory4Permission).save({
        parentId: 'dir-1',
        groupId: 'admins',
        method: PermissionMethod.READ,
      });
      await repo(Directory4Permission).save({
        parentId: 'dir-1',
        groupId: 'editors',
        method: PermissionMethod.READ,
      });
      await repo(Directory4Permission).save({ parentId: 'dir-1', method: PermissionMethod.WRITE });

      const response = await request(app.getHttpServer())
        .put('/directory/dir-1')
        .send({
          permissions: [
            { parentId: 'dir-1', groupId: 'admins', method: 'READ' },
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
      await repo(Directory).save({ id: 'dir-1' });
      const existingPerm = await repo(Directory4Permission).save({
        parentId: 'dir-1',
        groupId: 'admins',
        method: PermissionMethod.READ,
      });
      await repo(Directory4Permission).save({ parentId: 'dir-1', method: PermissionMethod.WRITE });

      const response = await request(app.getHttpServer())
        .put('/directory/dir-1')
        .send({
          permissions: [
            { parentId: 'dir-1', groupId: 'admins', method: 'READ' },
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

      const permAfter = await repo(Directory4Permission).findOne({
        where: {
          parentId: 'dir-1',
          groupId: 'admins',
          method: PermissionMethod.READ,
        },
      });
      expect(permAfter.id).toBe(existingPerm.id);
    });
  });

  describe('DELETE /directory/:id', () => {
    it('should return 404 for non-existent directory', async () => {
      const response = await request(app.getHttpServer())
        .delete('/directory/non-existent-id')
        .expect(404);

      expect(response.body.message).toBe(
        'Directory with id non-existent-id not found',
      );
      expect(response.body.details).toEqual({
        entity: 'Directory',
        id: 'non-existent-id',
      });
    });

    it('should delete the directory', async () => {
      await repo(Directory).save({ id: 'dir-1' });
      await repo(Directory4Permission).save({ parentId: 'dir-1', method: PermissionMethod.DELETE });

      await request(app.getHttpServer()).delete('/directory/dir-1').expect(200);

      const found = await repo(Directory).findOne({ where: { id: 'dir-1' } });
      expect(found).toBeNull();
    });

    it('should return 403 when no DELETE permission exists', async () => {
      await repo(Directory).save({ id: 'dir-1' });

      const response = await request(app.getHttpServer())
        .delete('/directory/dir-1')
        .expect(403);

      expect(response.body.message).toBe(
        'Permission denied: DELETE on Directory with id dir-1',
      );
    });
  });
});
