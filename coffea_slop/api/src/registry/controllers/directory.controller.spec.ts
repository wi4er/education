import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { DataSource, Repository, EntityTarget } from 'typeorm';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';
import { DirectoryController } from './directory.controller';
import { Directory } from '../entities/directory/directory.entity';
import { Attribute } from '../../settings/entities/attribute/attribute.entity';
import { Group } from '../../personal/entities/group/group.entity';
import { Directory4Permission } from '../entities/directory/directory4permission.entity';
import { Directory2String } from '../entities/directory/directory2string.entity';
import { Directory2Point } from '../entities/directory/directory2point.entity';
import { Point } from '../entities/point/point.entity';
import { TestDbModule } from '../../tests/test-db.module';
import { ExceptionModule } from '../../exception/exception.module';
import { CommonModule } from '../../common/common.module';
import { PermissionMethod } from '../../common/permission/permission.method';

const JWT_SECRET = 'test-secret';

describe('DirectoryController', () => {
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
        TypeOrmModule.forFeature([ Directory ]),
        JwtModule.register({ secret: JWT_SECRET }),
      ],
      controllers: [ DirectoryController ],
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

      expect(response.body).toEqual({ data: [], count: 0 });
    });

    it('should return an array of directories with relations', async () => {
      await repo(Directory).save({ id: 'dir-1' });
      await repo(Directory4Permission).save({ parentId: 'dir-1', method: PermissionMethod.READ });

      const response = await request(app.getHttpServer())
        .get('/directory')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.count).toBe(1);
      expect(response.body.data[0].id).toBe('dir-1');
      expect(response.body.data[0].attributes).toEqual({
        strings: [],
        points: [],
      });
      expect(response.body.data[0].permissions).toHaveLength(1);
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

      expect(response.body.data).toHaveLength(2);
      expect(response.body.count).toBe(2);
      expect(response.body.data.map(d => d.id)).toEqual([ 'dir-1', 'dir-3' ]);
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

      const token = jwtService.sign({ sub: 'user-1', groups: [ 'admins' ] });

      const response = await request(app.getHttpServer())
        .get('/directory')
        .set('Cookie', `auth_token=${token}`)
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.count).toBe(2);
      expect(response.body.data.map(d => d.id)).toEqual([ 'dir-1', 'dir-2' ]);
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

      const token = jwtService.sign({ sub: 'user-1', groups: [ 'users' ] });

      const response = await request(app.getHttpServer())
        .get('/directory')
        .set('Cookie', `auth_token=${token}`)
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.count).toBe(1);
      expect(response.body.data[0].id).toBe('dir-2');
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

      expect(response.body.data).toHaveLength(2);
      expect(response.body.count).toBe(3);
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

      expect(response.body.data).toHaveLength(2);
      expect(response.body.count).toBe(3);
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

      expect(response.body.data).toHaveLength(2);
      expect(response.body.count).toBe(4);
    });

    it('should return empty array when offset exceeds total directories', async () => {
      await repo(Directory).save({ id: 'dir-1' });
      await repo(Directory4Permission).save({ parentId: 'dir-1', method: PermissionMethod.READ });

      const response = await request(app.getHttpServer())
        .get('/directory?offset=10')
        .expect(200);

      expect(response.body.data).toEqual([]);
      expect(response.body.count).toBe(1);
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
          strings: [ { attr: 'name', value: 'Test Directory' } ],
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

    it('should return 400 when id is empty string', async () => {
      const response = await request(app.getHttpServer())
        .post('/directory')
        .send({ id: '' })
        .expect(400);

      expect(response.body.message).toBe('Database query failed');
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

    it('should add strings to directory', async () => {
      await repo(Attribute).save({ id: 'name' });
      await repo(Directory).save({ id: 'dir-1' });
      await repo(Directory4Permission).save({ parentId: 'dir-1', method: PermissionMethod.WRITE });

      const response = await request(app.getHttpServer())
        .put('/directory/dir-1')
        .send({
          strings: [{ attr: 'name', value: 'Updated Name' }],
        })
        .expect(200);

      expect(response.body.attributes.strings).toHaveLength(1);
      expect(response.body.attributes.strings[0]).toEqual({
        lang: null,
        attr: 'name',
        value: 'Updated Name',
      });
    });

    it('should update existing strings', async () => {
      await repo(Attribute).save({ id: 'name' });
      await repo(Directory).save({ id: 'dir-1' });
      await repo(Directory2String).save({ parentId: 'dir-1', attributeId: 'name', value: 'Old Name' });
      await repo(Directory4Permission).save({ parentId: 'dir-1', method: PermissionMethod.WRITE });

      const response = await request(app.getHttpServer())
        .put('/directory/dir-1')
        .send({
          strings: [{ attr: 'name', value: 'New Name' }],
        })
        .expect(200);

      expect(response.body.attributes.strings).toHaveLength(1);
      expect(response.body.attributes.strings[0].value).toBe('New Name');

      const stringsInDb = await repo(Directory2String).find({ where: { parentId: 'dir-1' } });
      expect(stringsInDb).toHaveLength(1);
    });

    it('should remove strings not in the update list', async () => {
      await repo(Attribute).save({ id: 'name' });
      await repo(Attribute).save({ id: 'desc' });
      await repo(Directory).save({ id: 'dir-1' });
      await repo(Directory2String).save({ parentId: 'dir-1', attributeId: 'name', value: 'Name' });
      await repo(Directory2String).save({ parentId: 'dir-1', attributeId: 'desc', value: 'Description' });
      await repo(Directory4Permission).save({ parentId: 'dir-1', method: PermissionMethod.WRITE });

      const response = await request(app.getHttpServer())
        .put('/directory/dir-1')
        .send({
          strings: [{ attr: 'name', value: 'Name' }],
        })
        .expect(200);

      expect(response.body.attributes.strings).toHaveLength(1);
      expect(response.body.attributes.strings[0].attr).toBe('name');

      const stringsInDb = await repo(Directory2String).find({ where: { parentId: 'dir-1' } });
      expect(stringsInDb).toHaveLength(1);
    });

    it('should add points to directory', async () => {
      await repo(Attribute).save({ id: 'location' });
      await repo(Directory).save({ id: 'dir-1' });
      await repo(Directory4Permission).save({ parentId: 'dir-1', method: PermissionMethod.ALL });
      await repo(Point).save({ id: 'point-1', directoryId: 'dir-1' });
      await repo(Directory4Permission).save({ parentId: 'dir-1', method: PermissionMethod.WRITE });

      const response = await request(app.getHttpServer())
        .put('/directory/dir-1')
        .send({
          points: [{ attr: 'location', pnt: 'point-1' }],
        })
        .expect(200);

      expect(response.body.attributes.points).toHaveLength(1);
      expect(response.body.attributes.points[0]).toEqual({
        attr: 'location',
        pnt: 'point-1',
      });
    });

    it('should remove points not in the update list', async () => {
      await repo(Attribute).save({ id: 'location' });
      await repo(Attribute).save({ id: 'origin' });
      await repo(Directory).save({ id: 'dir-1' });
      await repo(Directory4Permission).save({ parentId: 'dir-1', method: PermissionMethod.ALL });
      await repo(Point).save({ id: 'point-1', directoryId: 'dir-1' });
      await repo(Point).save({ id: 'point-2', directoryId: 'dir-1' });
      await repo(Directory2Point).save({ parentId: 'dir-1', attributeId: 'location', pointId: 'point-1' });
      await repo(Directory2Point).save({ parentId: 'dir-1', attributeId: 'origin', pointId: 'point-2' });
      await repo(Directory4Permission).save({ parentId: 'dir-1', method: PermissionMethod.WRITE });

      const response = await request(app.getHttpServer())
        .put('/directory/dir-1')
        .send({
          points: [{ attr: 'location', pnt: 'point-1' }],
        })
        .expect(200);

      expect(response.body.attributes.points).toHaveLength(1);
      expect(response.body.attributes.points[0].attr).toBe('location');

      const pointsInDb = await repo(Directory2Point).find({ where: { parentId: 'dir-1' } });
      expect(pointsInDb).toHaveLength(1);
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

      await request(app.getHttpServer())
        .delete('/directory/dir-1')
        .expect(200);

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
