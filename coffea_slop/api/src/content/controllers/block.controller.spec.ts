import {Test, TestingModule} from '@nestjs/testing';
import {INestApplication} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {JwtModule, JwtService} from '@nestjs/jwt';
import {DataSource} from 'typeorm';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';
import {BlockController} from './block.controller';
import {Block} from '../entities/block/block.entity';
import {Attribute} from '../../settings/entities/attribute/attribute.entity';
import {Group} from '../../personal/entities/group/group.entity';
import {TestDbModule} from '../../tests/test-db.module';
import {ExceptionModule} from '../../exception/exception.module';
import {CommonModule} from '../../common/common.module';
import {PermissionMethod} from '../../common/permission/permission.method';
import {Block4Permission} from '../entities/block/block4permission.entity';

const JWT_SECRET = 'test-secret';

describe('BlockController', () => {
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
        TypeOrmModule.forFeature([Block]),
        JwtModule.register({ secret: JWT_SECRET }),
      ],
      controllers: [BlockController],
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

  describe('GET /block', () => {
    it('should return an empty array when no blocks exist', async () => {
      const response = await request(app.getHttpServer())
        .get('/block')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return an array of blocks with relations', async () => {
      await repo(Block).save({ id: 'block-1' });
      await repo(Block4Permission).save({ parentId: 'block-1', method: PermissionMethod.READ });

      const response = await request(app.getHttpServer())
        .get('/block')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].id).toBe('block-1');
      expect(response.body[0].attributes).toEqual({
        strings: [],
        points: [],
        descriptions: [],
        counters: [],
        files: [],
      });
      expect(response.body[0].permissions).toHaveLength(1);
    });

    it('should filter out blocks without READ permission', async () => {
      await repo(Block).save({ id: 'block-1' });
      await repo(Block).save({ id: 'block-2' });
      await repo(Block).save({ id: 'block-3' });
      await repo(Block4Permission).save({ parentId: 'block-1', method: PermissionMethod.READ });
      await repo(Block4Permission).save({ parentId: 'block-3', method: PermissionMethod.READ });

      const response = await request(app.getHttpServer())
        .get('/block')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body.map((b) => b.id)).toEqual(['block-1', 'block-3']);
    });

    it('should return blocks with group permission when user has matching group in token', async () => {
      await repo(Group).save({ id: 'admins' });
      await repo(Block).save({ id: 'block-1' });
      await repo(Block).save({ id: 'block-2' });
      await repo(Block4Permission).save({
        parentId: 'block-1',
        groupId: 'admins',
        method: PermissionMethod.READ,
      });
      await repo(Block4Permission).save({ parentId: 'block-2', method: PermissionMethod.READ });

      const token = jwtService.sign({ sub: 'user-1', groups: ['admins'] });

      const response = await request(app.getHttpServer())
        .get('/block')
        .set('Cookie', `auth_token=${token}`)
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body.map((b) => b.id)).toEqual(['block-1', 'block-2']);
    });

    it('should not return blocks with group permission when user lacks that group', async () => {
      await repo(Group).save({ id: 'admins' });
      await repo(Block).save({ id: 'block-1' });
      await repo(Block).save({ id: 'block-2' });
      await repo(Block4Permission).save({
        parentId: 'block-1',
        groupId: 'admins',
        method: PermissionMethod.READ,
      });
      await repo(Block4Permission).save({ parentId: 'block-2', method: PermissionMethod.READ });

      const token = jwtService.sign({ sub: 'user-1', groups: ['users'] });

      const response = await request(app.getHttpServer())
        .get('/block')
        .set('Cookie', `auth_token=${token}`)
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].id).toBe('block-2');
    });
  });

  describe('GET /block with pagination', () => {
    it('should return limited blocks when limit is provided', async () => {
      await repo(Block).save({ id: 'block-1' });
      await repo(Block).save({ id: 'block-2' });
      await repo(Block).save({ id: 'block-3' });
      await repo(Block4Permission).save({ parentId: 'block-1', method: PermissionMethod.READ });
      await repo(Block4Permission).save({ parentId: 'block-2', method: PermissionMethod.READ });
      await repo(Block4Permission).save({ parentId: 'block-3', method: PermissionMethod.READ });

      const response = await request(app.getHttpServer())
        .get('/block?limit=2')
        .expect(200);

      expect(response.body).toHaveLength(2);
    });

    it('should skip blocks when offset is provided', async () => {
      await repo(Block).save({ id: 'block-1' });
      await repo(Block).save({ id: 'block-2' });
      await repo(Block).save({ id: 'block-3' });
      await repo(Block4Permission).save({ parentId: 'block-1', method: PermissionMethod.READ });
      await repo(Block4Permission).save({ parentId: 'block-2', method: PermissionMethod.READ });
      await repo(Block4Permission).save({ parentId: 'block-3', method: PermissionMethod.READ });

      const response = await request(app.getHttpServer())
        .get('/block?offset=1')
        .expect(200);

      expect(response.body).toHaveLength(2);
    });

    it('should return paginated blocks when both limit and offset are provided', async () => {
      await repo(Block).save({ id: 'block-1' });
      await repo(Block).save({ id: 'block-2' });
      await repo(Block).save({ id: 'block-3' });
      await repo(Block).save({ id: 'block-4' });
      await repo(Block4Permission).save({ parentId: 'block-1', method: PermissionMethod.READ });
      await repo(Block4Permission).save({ parentId: 'block-2', method: PermissionMethod.READ });
      await repo(Block4Permission).save({ parentId: 'block-3', method: PermissionMethod.READ });
      await repo(Block4Permission).save({ parentId: 'block-4', method: PermissionMethod.READ });

      const response = await request(app.getHttpServer())
        .get('/block?limit=2&offset=1')
        .expect(200);

      expect(response.body).toHaveLength(2);
    });

    it('should return empty array when offset exceeds total blocks', async () => {
      await repo(Block).save({ id: 'block-1' });
      await repo(Block4Permission).save({ parentId: 'block-1', method: PermissionMethod.READ });

      const response = await request(app.getHttpServer())
        .get('/block?offset=10')
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });

  describe('GET /block/:id', () => {
    it('should return a single block with relations', async () => {
      await repo(Block).save({ id: 'block-1' });
      await repo(Block4Permission).save({ parentId: 'block-1', method: PermissionMethod.READ });

      const response = await request(app.getHttpServer())
        .get('/block/block-1')
        .expect(200);

      expect(response.body.id).toBe('block-1');
      expect(response.body.attributes).toEqual({
        strings: [],
        points: [],
        descriptions: [],
        counters: [],
        files: [],
      });
      expect(response.body.permissions).toHaveLength(1);
    });

    it('should return 404 for non-existent block', async () => {
      const response = await request(app.getHttpServer())
        .get('/block/non-existent-id')
        .expect(404);

      expect(response.body.message).toBe(
        'Block with id non-existent-id not found',
      );
      expect(response.body.details).toEqual({
        entity: 'Block',
        id: 'non-existent-id',
      });
    });

    it('should return 403 when no READ permission exists', async () => {
      await repo(Block).save({ id: 'block-1' });

      const response = await request(app.getHttpServer())
        .get('/block/block-1')
        .expect(403);

      expect(response.body.message).toBe(
        'Permission denied: READ on Block with id block-1',
      );
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
        counters: [],
        files: [],
      });

      const found = await repo(Block)
        .findOne({ where: { id: 'new-block' } });
      expect(found).not.toBeNull();
    });

    it('should create block with strings', async () => {
      await repo(Attribute).save({ id: 'name' });

      const response = await request(app.getHttpServer())
        .post('/block')
        .send({
          id: 'new-block',
          strings: [{ attr: 'name', value: 'Test Block' }],
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
      await repo(Attribute).save({ id: 'content' });

      const response = await request(app.getHttpServer())
        .post('/block')
        .send({
          id: 'new-block',
          descriptions: [{ attr: 'content', value: 'Long description text' }],
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
      await repo(Group).save({ id: 'admins' });

      const response = await request(app.getHttpServer())
        .post('/block')
        .send({
          id: 'new-block',
          permissions: [
            { parentId: 'new-block', groupId: 'admins', method: 'READ' },
          ],
        })
        .expect(201);

      expect(response.body.id).toBe('new-block');
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
        .post('/block')
        .send({ id: '' })
        .expect(400);

      expect(response.body.message).toBe('Database query failed');
    });
  });

  describe('PUT /block/:id', () => {
    it('should return 404 for non-existent block', async () => {
      const response = await request(app.getHttpServer())
        .put('/block/non-existent-id')
        .send({})
        .expect(404);

      expect(response.body.message).toBe(
        'Block with id non-existent-id not found',
      );
      expect(response.body.details).toEqual({
        entity: 'Block',
        id: 'non-existent-id',
      });
    });

    it('should update and return the block', async () => {
      await repo(Block).save({ id: 'block-1' });
      await repo(Block4Permission).save({ parentId: 'block-1', method: PermissionMethod.WRITE });

      const response = await request(app.getHttpServer())
        .put('/block/block-1')
        .send({})
        .expect(200);

      expect(response.body.id).toBe('block-1');
    });

    it('should return 403 when no WRITE permission exists', async () => {
      await repo(Block).save({ id: 'block-1' });

      const response = await request(app.getHttpServer())
        .put('/block/block-1')
        .send({})
        .expect(403);

      expect(response.body.message).toBe(
        'Permission denied: WRITE on Block with id block-1',
      );
    });

    it('should add new permissions without removing existing ones', async () => {
      await repo(Group).save({ id: 'admins' });
      await repo(Group).save({ id: 'editors' });
      await repo(Block).save({ id: 'block-1' });
      await repo(Block4Permission).save({
        parentId: 'block-1',
        groupId: 'admins',
        method: PermissionMethod.READ,
      });
      await repo(Block4Permission).save({ parentId: 'block-1', method: PermissionMethod.WRITE });

      const response = await request(app.getHttpServer())
        .put('/block/block-1')
        .send({
          permissions: [
            { parentId: 'block-1', groupId: 'admins', method: 'READ' },
            { parentId: 'block-1', groupId: 'editors', method: 'READ' },
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
      await repo(Block).save({ id: 'block-1' });
      await repo(Block4Permission).save({
        parentId: 'block-1',
        groupId: 'admins',
        method: PermissionMethod.READ,
      });
      await repo(Block4Permission).save({
        parentId: 'block-1',
        groupId: 'editors',
        method: PermissionMethod.READ,
      });
      await repo(Block4Permission).save({ parentId: 'block-1', method: PermissionMethod.WRITE });

      const response = await request(app.getHttpServer())
        .put('/block/block-1')
        .send({
          permissions: [
            { parentId: 'block-1', groupId: 'admins', method: 'READ' },
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
      await repo(Block).save({ id: 'block-1' });
      const existingPerm = await repo(Block4Permission)
        .save({
          parentId: 'block-1',
          groupId: 'admins',
          method: PermissionMethod.READ,
        });
      await repo(Block4Permission).save({ parentId: 'block-1', method: PermissionMethod.WRITE });

      const response = await request(app.getHttpServer())
        .put('/block/block-1')
        .send({
          permissions: [
            { parentId: 'block-1', groupId: 'admins', method: 'READ' },
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

      const permAfter = await repo(Block4Permission)
        .findOne({
          where: {
            parentId: 'block-1',
            groupId: 'admins',
            method: PermissionMethod.READ,
          },
        });
      expect(permAfter.id).toBe(existingPerm.id);
    });
  });

  describe('DELETE /block/:id', () => {
    it('should return 404 for non-existent block', async () => {
      const response = await request(app.getHttpServer())
        .delete('/block/non-existent-id')
        .expect(404);

      expect(response.body.message).toBe(
        'Block with id non-existent-id not found',
      );
      expect(response.body.details).toEqual({
        entity: 'Block',
        id: 'non-existent-id',
      });
    });

    it('should delete the block', async () => {
      await repo(Block).save({ id: 'block-1' });
      await repo(Block4Permission).save({ parentId: 'block-1', method: PermissionMethod.DELETE });

      await request(app.getHttpServer()).delete('/block/block-1').expect(200);

      const found = await repo(Block)
        .findOne({ where: { id: 'block-1' } });
      expect(found).toBeNull();
    });

    it('should return 403 when no DELETE permission exists', async () => {
      await repo(Block).save({ id: 'block-1' });

      const response = await request(app.getHttpServer())
        .delete('/block/block-1')
        .expect(403);

      expect(response.body.message).toBe(
        'Permission denied: DELETE on Block with id block-1',
      );
    });
  });
});
