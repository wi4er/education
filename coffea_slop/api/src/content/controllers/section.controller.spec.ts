import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { DataSource, Repository, EntityTarget } from 'typeorm';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';
import { SectionController } from './section.controller';
import { Section } from '../entities/section/section.entity';
import { Block } from '../entities/block/block.entity';
import { Attribute } from '../../settings/entities/attribute/attribute.entity';
import { Group } from '../../personal/entities/group/group.entity';
import { TestDbModule } from '../../tests/test-db.module';
import { ExceptionModule } from '../../exception/exception.module';
import { CommonModule } from '../../common/common.module';
import { PermissionMethod } from '../../common/permission/permission.method';
import { Section4Permission } from '../entities/section/section4permission.entity';

const JWT_SECRET = 'test-secret';

describe('SectionController', () => {
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
        TypeOrmModule.forFeature([Section]),
        JwtModule.register({ secret: JWT_SECRET }),
      ],
      controllers: [SectionController],
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

  describe('GET /section', () => {
    it('should return an empty array when no sections exist', async () => {
      const response = await request(app.getHttpServer())
        .get('/section')
        .expect(200);

      expect(response.body).toEqual({ data: [], count: 0 });
    });

    it('should return an array of sections with relations', async () => {
      await repo(Block).save({ id: 'block-1' });
      await repo(Section).save({ id: 'section-1', parentId: 'block-1' });
      await repo(Section4Permission).save({ parentId: 'section-1', method: PermissionMethod.READ });

      const response = await request(app.getHttpServer())
        .get('/section')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].id).toBe('section-1');
      expect(response.body.data[0].parentId).toBe('block-1');
      expect(response.body.data[0].attributes).toEqual({
        strings: [],
        points: [],
        descriptions: [],
        counters: [],
        files: [],
      });
      expect(response.body.data[0].permissions).toHaveLength(1);
    });

    it('should filter out sections without READ permission', async () => {
      await repo(Block).save({ id: 'block-1' });
      await repo(Section).save({ id: 'section-1', parentId: 'block-1' });
      await repo(Section).save({ id: 'section-2', parentId: 'block-1' });
      await repo(Section).save({ id: 'section-3', parentId: 'block-1' });
      await repo(Section4Permission).save({ parentId: 'section-1', method: PermissionMethod.READ });
      await repo(Section4Permission).save({ parentId: 'section-3', method: PermissionMethod.READ });

      const response = await request(app.getHttpServer())
        .get('/section')
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.data.map((s) => s.id)).toEqual([
        'section-1',
        'section-3',
      ]);
    });

    it('should return sections with group permission when user has matching group in token', async () => {
      await repo(Group).save({ id: 'admins' });
      await repo(Block).save({ id: 'block-1' });
      await repo(Section).save({ id: 'section-1', parentId: 'block-1' });
      await repo(Section).save({ id: 'section-2', parentId: 'block-1' });
      await repo(Section4Permission).save({
        parentId: 'section-1',
        groupId: 'admins',
        method: PermissionMethod.READ,
      });
      await repo(Section4Permission).save({ parentId: 'section-2', method: PermissionMethod.READ });

      const token = jwtService.sign({ sub: 'user-1', groups: ['admins'] });

      const response = await request(app.getHttpServer())
        .get('/section')
        .set('Cookie', `auth_token=${token}`)
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.data.map((s) => s.id)).toEqual([
        'section-1',
        'section-2',
      ]);
    });

    it('should not return sections with group permission when user lacks that group', async () => {
      await repo(Group).save({ id: 'admins' });
      await repo(Block).save({ id: 'block-1' });
      await repo(Section).save({ id: 'section-1', parentId: 'block-1' });
      await repo(Section).save({ id: 'section-2', parentId: 'block-1' });
      await repo(Section4Permission).save({
        parentId: 'section-1',
        groupId: 'admins',
        method: PermissionMethod.READ,
      });
      await repo(Section4Permission).save({ parentId: 'section-2', method: PermissionMethod.READ });

      const token = jwtService.sign({ sub: 'user-1', groups: ['users'] });

      const response = await request(app.getHttpServer())
        .get('/section')
        .set('Cookie', `auth_token=${token}`)
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].id).toBe('section-2');
    });
  });

  describe('GET /section with pagination', () => {
    it('should return limited sections when limit is provided', async () => {
      await repo(Block).save({ id: 'block-1' });
      await repo(Section).save({ id: 'section-1', parentId: 'block-1' });
      await repo(Section).save({ id: 'section-2', parentId: 'block-1' });
      await repo(Section).save({ id: 'section-3', parentId: 'block-1' });
      await repo(Section4Permission).save({ parentId: 'section-1', method: PermissionMethod.READ });
      await repo(Section4Permission).save({ parentId: 'section-2', method: PermissionMethod.READ });
      await repo(Section4Permission).save({ parentId: 'section-3', method: PermissionMethod.READ });

      const response = await request(app.getHttpServer())
        .get('/section?limit=2')
        .expect(200);

      expect(response.body.data).toHaveLength(2);
    });

    it('should skip sections when offset is provided', async () => {
      await repo(Block).save({ id: 'block-1' });
      await repo(Section).save({ id: 'section-1', parentId: 'block-1' });
      await repo(Section).save({ id: 'section-2', parentId: 'block-1' });
      await repo(Section).save({ id: 'section-3', parentId: 'block-1' });
      await repo(Section4Permission).save({ parentId: 'section-1', method: PermissionMethod.READ });
      await repo(Section4Permission).save({ parentId: 'section-2', method: PermissionMethod.READ });
      await repo(Section4Permission).save({ parentId: 'section-3', method: PermissionMethod.READ });

      const response = await request(app.getHttpServer())
        .get('/section?offset=1')
        .expect(200);

      expect(response.body.data).toHaveLength(2);
    });

    it('should return paginated sections when both limit and offset are provided', async () => {
      await repo(Block).save({ id: 'block-1' });
      await repo(Section).save({ id: 'section-1', parentId: 'block-1' });
      await repo(Section).save({ id: 'section-2', parentId: 'block-1' });
      await repo(Section).save({ id: 'section-3', parentId: 'block-1' });
      await repo(Section).save({ id: 'section-4', parentId: 'block-1' });
      await repo(Section4Permission).save({ parentId: 'section-1', method: PermissionMethod.READ });
      await repo(Section4Permission).save({ parentId: 'section-2', method: PermissionMethod.READ });
      await repo(Section4Permission).save({ parentId: 'section-3', method: PermissionMethod.READ });
      await repo(Section4Permission).save({ parentId: 'section-4', method: PermissionMethod.READ });

      const response = await request(app.getHttpServer())
        .get('/section?limit=2&offset=1')
        .expect(200);

      expect(response.body.data).toHaveLength(2);
    });

    it('should return empty array when offset exceeds total sections', async () => {
      await repo(Block).save({ id: 'block-1' });
      await repo(Section).save({ id: 'section-1', parentId: 'block-1' });
      await repo(Section4Permission).save({ parentId: 'section-1', method: PermissionMethod.READ });

      const response = await request(app.getHttpServer())
        .get('/section?offset=10')
        .expect(200);

      expect(response.body.data).toEqual([]);
    });
  });

  describe('GET /section/:id', () => {
    it('should return a single section with relations', async () => {
      await repo(Block).save({ id: 'block-1' });
      await repo(Section).save({ id: 'section-1', parentId: 'block-1' });
      await repo(Section4Permission).save({ parentId: 'section-1', method: PermissionMethod.READ });

      const response = await request(app.getHttpServer())
        .get('/section/section-1')
        .expect(200);

      expect(response.body.id).toBe('section-1');
      expect(response.body.parentId).toBe('block-1');
      expect(response.body.attributes).toEqual({
        strings: [],
        points: [],
        descriptions: [],
        counters: [],
        files: [],
      });
      expect(response.body.permissions).toHaveLength(1);
    });

    it('should return 404 for non-existent section', async () => {
      const response = await request(app.getHttpServer())
        .get('/section/non-existent-id')
        .expect(404);

      expect(response.body.message).toBe(
        'Section with id non-existent-id not found',
      );
      expect(response.body.details).toEqual({
        entity: 'Section',
        id: 'non-existent-id',
      });
    });

    it('should return 403 when no READ permission exists', async () => {
      await repo(Block).save({ id: 'block-1' });
      await repo(Section).save({ id: 'section-1', parentId: 'block-1' });

      const response = await request(app.getHttpServer())
        .get('/section/section-1')
        .expect(403);

      expect(response.body.message).toBe(
        'Permission denied: READ on Section with id section-1',
      );
    });
  });

  describe('POST /section', () => {
    it('should create and return a new section', async () => {
      await repo(Block).save({ id: 'block-1' });

      const response = await request(app.getHttpServer())
        .post('/section')
        .send({ id: 'new-section', parentId: 'block-1' })
        .expect(201);

      expect(response.body.id).toBe('new-section');
      expect(response.body.parentId).toBe('block-1');
      expect(response.body.attributes).toEqual({
        strings: [],
        points: [],
        descriptions: [],
        counters: [],
        files: [],
      });

      const found = await repo(Section)
        .findOne({ where: { id: 'new-section' } });
      expect(found).not.toBeNull();
    });

    it('should create section with strings', async () => {
      await repo(Block).save({ id: 'block-1' });
      await repo(Attribute).save({ id: 'name' });

      const response = await request(app.getHttpServer())
        .post('/section')
        .send({
          id: 'new-section',
          parentId: 'block-1',
          strings: [{ attr: 'name', value: 'Test Section' }],
        })
        .expect(201);

      expect(response.body.id).toBe('new-section');
      expect(response.body.attributes.strings).toHaveLength(1);
      expect(response.body.attributes.strings[0]).toEqual({
        lang: null,
        attr: 'name',
        value: 'Test Section',
      });
    });

    it('should create section with descriptions', async () => {
      await repo(Block).save({ id: 'block-1' });
      await repo(Attribute).save({ id: 'content' });

      const response = await request(app.getHttpServer())
        .post('/section')
        .send({
          id: 'new-section',
          parentId: 'block-1',
          descriptions: [{ attr: 'content', value: 'Long description text' }],
        })
        .expect(201);

      expect(response.body.id).toBe('new-section');
      expect(response.body.attributes.descriptions).toHaveLength(1);
      expect(response.body.attributes.descriptions[0]).toEqual({
        lang: null,
        attr: 'content',
        value: 'Long description text',
      });
    });

    it('should create section with permissions', async () => {
      await repo(Block).save({ id: 'block-1' });
      await repo(Group).save({ id: 'admins' });

      const response = await request(app.getHttpServer())
        .post('/section')
        .send({
          id: 'new-section',
          parentId: 'block-1',
          permissions: [
            { parentId: 'new-section', groupId: 'admins', method: 'READ' },
          ],
        })
        .expect(201);

      expect(response.body.id).toBe('new-section');
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
      await repo(Block).save({ id: 'block-1' });

      const response = await request(app.getHttpServer())
        .post('/section')
        .send({ id: '', parentId: 'block-1' })
        .expect(400);

      expect(response.body.message).toBe('Database query failed');
    });
  });

  describe('PUT /section/:id', () => {
    it('should return 404 for non-existent section', async () => {
      const response = await request(app.getHttpServer())
        .put('/section/non-existent-id')
        .send({ parentId: 'block-1' })
        .expect(404);

      expect(response.body.message).toBe(
        'Section with id non-existent-id not found',
      );
      expect(response.body.details).toEqual({
        entity: 'Section',
        id: 'non-existent-id',
      });
    });

    it('should update and return the section', async () => {
      const blockRepo = repo(Block);
      await blockRepo.save({ id: 'block-1' });
      await blockRepo.save({ id: 'block-2' });
      await repo(Section).save({ id: 'section-1', parentId: 'block-1' });
      await repo(Section4Permission).save({ parentId: 'section-1', method: PermissionMethod.WRITE });

      const response = await request(app.getHttpServer())
        .put('/section/section-1')
        .send({ parentId: 'block-2' })
        .expect(200);

      expect(response.body.id).toBe('section-1');
      expect(response.body.parentId).toBe('block-2');
    });

    it('should return 403 when no WRITE permission exists', async () => {
      await repo(Block).save({ id: 'block-1' });
      await repo(Section).save({ id: 'section-1', parentId: 'block-1' });

      const response = await request(app.getHttpServer())
        .put('/section/section-1')
        .send({ parentId: 'block-1' })
        .expect(403);

      expect(response.body.message).toBe(
        'Permission denied: WRITE on Section with id section-1',
      );
    });

    it('should add new permissions without removing existing ones', async () => {
      await repo(Group).save({ id: 'admins' });
      await repo(Group).save({ id: 'editors' });
      await repo(Block).save({ id: 'block-1' });
      await repo(Section).save({ id: 'section-1', parentId: 'block-1' });
      await repo(Section4Permission).save({
        parentId: 'section-1',
        groupId: 'admins',
        method: PermissionMethod.READ,
      });
      await repo(Section4Permission).save({ parentId: 'section-1', method: PermissionMethod.WRITE });

      const response = await request(app.getHttpServer())
        .put('/section/section-1')
        .send({
          parentId: 'block-1',
          permissions: [
            { parentId: 'section-1', groupId: 'admins', method: 'READ' },
            { parentId: 'section-1', groupId: 'editors', method: 'READ' },
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
      await repo(Section).save({ id: 'section-1', parentId: 'block-1' });
      await repo(Section4Permission).save({
        parentId: 'section-1',
        groupId: 'admins',
        method: PermissionMethod.READ,
      });
      await repo(Section4Permission).save({
        parentId: 'section-1',
        groupId: 'editors',
        method: PermissionMethod.READ,
      });
      await repo(Section4Permission).save({ parentId: 'section-1', method: PermissionMethod.WRITE });

      const response = await request(app.getHttpServer())
        .put('/section/section-1')
        .send({
          parentId: 'block-1',
          permissions: [
            { parentId: 'section-1', groupId: 'admins', method: 'READ' },
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
      await repo(Section).save({ id: 'section-1', parentId: 'block-1' });
      const existingPerm = await repo(Section4Permission)
        .save({
          parentId: 'section-1',
          groupId: 'admins',
          method: PermissionMethod.READ,
        });
      await repo(Section4Permission).save({ parentId: 'section-1', method: PermissionMethod.WRITE });

      const response = await request(app.getHttpServer())
        .put('/section/section-1')
        .send({
          parentId: 'block-1',
          permissions: [
            { parentId: 'section-1', groupId: 'admins', method: 'READ' },
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

      const permAfter = await repo(Section4Permission)
        .findOne({
          where: {
            parentId: 'section-1',
            groupId: 'admins',
            method: PermissionMethod.READ,
          },
        });
      expect(permAfter.id).toBe(existingPerm.id);
    });
  });

  describe('DELETE /section/:id', () => {
    it('should return 404 for non-existent section', async () => {
      const response = await request(app.getHttpServer())
        .delete('/section/non-existent-id')
        .expect(404);

      expect(response.body.message).toBe(
        'Section with id non-existent-id not found',
      );
      expect(response.body.details).toEqual({
        entity: 'Section',
        id: 'non-existent-id',
      });
    });

    it('should delete the section', async () => {
      await repo(Block).save({ id: 'block-1' });
      await repo(Section).save({ id: 'section-1', parentId: 'block-1' });
      await repo(Section4Permission).save({ parentId: 'section-1', method: PermissionMethod.DELETE });

      await request(app.getHttpServer())
        .delete('/section/section-1')
        .expect(204);

      const found = await repo(Section)
        .findOne({ where: { id: 'section-1' } });
      expect(found).toBeNull();
    });

    it('should return 403 when no DELETE permission exists', async () => {
      await repo(Block).save({ id: 'block-1' });
      await repo(Section).save({ id: 'section-1', parentId: 'block-1' });

      const response = await request(app.getHttpServer())
        .delete('/section/section-1')
        .expect(403);

      expect(response.body.message).toBe(
        'Permission denied: DELETE on Section with id section-1',
      );
    });
  });
});
