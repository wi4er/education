import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { DataSource, Repository, EntityTarget } from 'typeorm';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';
import { ElementController } from './element.controller';
import { Element } from '../entities/element/element.entity';
import { Block } from '../entities/block/block.entity';
import { Section } from '../entities/section/section.entity';
import { Attribute } from '../../settings/entities/attribute/attribute.entity';
import { Language } from '../../settings/entities/language/language.entity';
import { Group } from '../../personal/entities/group/group.entity';
import { Directory } from '../../registry/entities/directory/directory.entity';
import { Point } from '../../registry/entities/point/point.entity';
import { TestDbModule } from '../../tests/test-db.module';
import { ExceptionModule } from '../../exception/exception.module';
import { CommonModule } from '../../common/common.module';
import { PermissionMethod } from '../../common/permission/permission.method';
import { Element4Permission } from '../entities/element/element4permission.entity';
import { Element2String } from '../entities/element/element2string.entity';
import { Element2Point } from '../entities/element/element2point.entity';
import { Element2Counter } from '../entities/element/element2counter.entity';
import { SectionService } from '../services/section.service';
import { ElementFilterService } from '../services/element-filter.service';
import { ElementSortService } from '../services/element-sort.service';

const JWT_SECRET = 'test-secret';

describe('ElementController', () => {
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
        TypeOrmModule.forFeature([Element]),
        JwtModule.register({ secret: JWT_SECRET }),
      ],
      controllers: [ElementController],
      providers: [SectionService, ElementFilterService, ElementSortService],
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

  describe('GET /element', () => {
    it('should return an empty array when no elements exist', async () => {
      const response = await request(app.getHttpServer())
        .get('/element')
        .expect(200);

      expect(response.body).toEqual({ data: [], count: 0 });
    });

    it('should return an array of elements with relations', async () => {
      await repo(Block).save({ id: 'block-1' });
      await repo(Element).save({ id: 'element-1', parentId: 'block-1' });
      await repo(Element4Permission).save({ parentId: 'element-1', method: PermissionMethod.READ });

      const response = await request(app.getHttpServer())
        .get('/element')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].id).toBe('element-1');
      expect(response.body.data[0].parentId).toBe('block-1');
      expect(response.body.data[0].attributes).toEqual({
        strings: [],
        points: [],
        descriptions: [],
        counters: [],
        files: [],
      });
      expect(response.body.data[0].permissions).toHaveLength(1);
      expect(response.body.data[0].sections).toEqual([]);
    });

    it('should filter out elements without READ permission', async () => {
      await repo(Block).save({ id: 'block-1' });
      await repo(Element).save({ id: 'element-1', parentId: 'block-1' });
      await repo(Element).save({ id: 'element-2', parentId: 'block-1' });
      await repo(Element).save({ id: 'element-3', parentId: 'block-1' });
      await repo(Element4Permission).save({ parentId: 'element-1', method: PermissionMethod.READ });
      await repo(Element4Permission).save({ parentId: 'element-3', method: PermissionMethod.READ });

      const response = await request(app.getHttpServer())
        .get('/element')
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.data.map((e) => e.id)).toEqual([
        'element-1',
        'element-3',
      ]);
    });

    it('should return elements with group permission when user has matching group in token', async () => {
      await repo(Group).save({ id: 'admins' });
      await repo(Block).save({ id: 'block-1' });
      await repo(Element).save({ id: 'element-1', parentId: 'block-1' });
      await repo(Element).save({ id: 'element-2', parentId: 'block-1' });
      await repo(Element4Permission).save({
        parentId: 'element-1',
        groupId: 'admins',
        method: PermissionMethod.READ,
      });
      await repo(Element4Permission).save({ parentId: 'element-2', method: PermissionMethod.READ });

      const token = jwtService.sign({ sub: 'user-1', groups: ['admins'] });

      const response = await request(app.getHttpServer())
        .get('/element')
        .set('Cookie', `auth_token=${token}`)
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.data.map((e) => e.id)).toEqual([
        'element-1',
        'element-2',
      ]);
    });

    it('should not return elements with group permission when user lacks that group', async () => {
      await repo(Group).save({ id: 'admins' });
      await repo(Block).save({ id: 'block-1' });
      await repo(Element).save({ id: 'element-1', parentId: 'block-1' });
      await repo(Element).save({ id: 'element-2', parentId: 'block-1' });
      await repo(Element4Permission).save({
        parentId: 'element-1',
        groupId: 'admins',
        method: PermissionMethod.READ,
      });
      await repo(Element4Permission).save({ parentId: 'element-2', method: PermissionMethod.READ });

      const token = jwtService.sign({ sub: 'user-1', groups: ['users'] });

      const response = await request(app.getHttpServer())
        .get('/element')
        .set('Cookie', `auth_token=${token}`)
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].id).toBe('element-2');
    });
  });

  describe('GET /element with pagination', () => {
    it('should return limited elements when limit is provided', async () => {
      await repo(Block).save({ id: 'block-1' });
      await repo(Element).save({ id: 'element-1', parentId: 'block-1' });
      await repo(Element).save({ id: 'element-2', parentId: 'block-1' });
      await repo(Element).save({ id: 'element-3', parentId: 'block-1' });
      await repo(Element4Permission).save({ parentId: 'element-1', method: PermissionMethod.READ });
      await repo(Element4Permission).save({ parentId: 'element-2', method: PermissionMethod.READ });
      await repo(Element4Permission).save({ parentId: 'element-3', method: PermissionMethod.READ });

      const response = await request(app.getHttpServer())
        .get('/element?limit=2')
        .expect(200);

      expect(response.body.data).toHaveLength(2);
    });

    it('should skip elements when offset is provided', async () => {
      await repo(Block).save({ id: 'block-1' });
      await repo(Element).save({ id: 'element-1', parentId: 'block-1' });
      await repo(Element).save({ id: 'element-2', parentId: 'block-1' });
      await repo(Element).save({ id: 'element-3', parentId: 'block-1' });
      await repo(Element4Permission).save({ parentId: 'element-1', method: PermissionMethod.READ });
      await repo(Element4Permission).save({ parentId: 'element-2', method: PermissionMethod.READ });
      await repo(Element4Permission).save({ parentId: 'element-3', method: PermissionMethod.READ });

      const response = await request(app.getHttpServer())
        .get('/element?offset=1')
        .expect(200);

      expect(response.body.data).toHaveLength(2);
    });

    it('should return paginated elements when both limit and offset are provided', async () => {
      await repo(Block).save({ id: 'block-1' });
      await repo(Element).save({ id: 'element-1', parentId: 'block-1' });
      await repo(Element).save({ id: 'element-2', parentId: 'block-1' });
      await repo(Element).save({ id: 'element-3', parentId: 'block-1' });
      await repo(Element).save({ id: 'element-4', parentId: 'block-1' });
      await repo(Element4Permission).save({ parentId: 'element-1', method: PermissionMethod.READ });
      await repo(Element4Permission).save({ parentId: 'element-2', method: PermissionMethod.READ });
      await repo(Element4Permission).save({ parentId: 'element-3', method: PermissionMethod.READ });
      await repo(Element4Permission).save({ parentId: 'element-4', method: PermissionMethod.READ });

      const response = await request(app.getHttpServer())
        .get('/element?limit=2&offset=1')
        .expect(200);

      expect(response.body.data).toHaveLength(2);
    });

    it('should return empty array when offset exceeds total elements', async () => {
      await repo(Block).save({ id: 'block-1' });
      await repo(Element).save({ id: 'element-1', parentId: 'block-1' });
      await repo(Element4Permission).save({ parentId: 'element-1', method: PermissionMethod.READ });

      const response = await request(app.getHttpServer())
        .get('/element?offset=10')
        .expect(200);

      expect(response.body.data).toEqual([]);
    });
  });

  describe('GET /element with pagination and permission', () => {
    it('should apply limit after permission filtering', async () => {
      await repo(Block).save({ id: 'block-1' });
      await repo(Element).save({ id: 'element-1', parentId: 'block-1' });
      await repo(Element).save({ id: 'element-2', parentId: 'block-1' });
      await repo(Element).save({ id: 'element-3', parentId: 'block-1' });
      await repo(Element).save({ id: 'element-4', parentId: 'block-1' });
      await repo(Element4Permission).save({ parentId: 'element-1', method: PermissionMethod.READ });
      await repo(Element4Permission).save({ parentId: 'element-3', method: PermissionMethod.READ });
      await repo(Element4Permission).save({ parentId: 'element-4', method: PermissionMethod.READ });

      const response = await request(app.getHttpServer())
        .get('/element?limit=2')
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.data.map((e) => e.id)).toEqual(['element-1', 'element-3']);
    });

    it('should apply offset after permission filtering', async () => {
      await repo(Block).save({ id: 'block-1' });
      await repo(Element).save({ id: 'element-1', parentId: 'block-1' });
      await repo(Element).save({ id: 'element-2', parentId: 'block-1' });
      await repo(Element).save({ id: 'element-3', parentId: 'block-1' });
      await repo(Element).save({ id: 'element-4', parentId: 'block-1' });
      await repo(Element4Permission).save({ parentId: 'element-1', method: PermissionMethod.READ });
      await repo(Element4Permission).save({ parentId: 'element-3', method: PermissionMethod.READ });
      await repo(Element4Permission).save({ parentId: 'element-4', method: PermissionMethod.READ });

      const response = await request(app.getHttpServer())
        .get('/element?offset=1')
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.data.map((e) => e.id)).toEqual(['element-3', 'element-4']);
    });

    it('should apply both limit and offset after permission filtering', async () => {
      await repo(Block).save({ id: 'block-1' });
      await repo(Element).save({ id: 'element-1', parentId: 'block-1' });
      await repo(Element).save({ id: 'element-2', parentId: 'block-1' });
      await repo(Element).save({ id: 'element-3', parentId: 'block-1' });
      await repo(Element).save({ id: 'element-4', parentId: 'block-1' });
      await repo(Element).save({ id: 'element-5', parentId: 'block-1' });
      await repo(Element4Permission).save({ parentId: 'element-1', method: PermissionMethod.READ });
      await repo(Element4Permission).save({ parentId: 'element-3', method: PermissionMethod.READ });
      await repo(Element4Permission).save({ parentId: 'element-4', method: PermissionMethod.READ });
      await repo(Element4Permission).save({ parentId: 'element-5', method: PermissionMethod.READ });

      const response = await request(app.getHttpServer())
        .get('/element?limit=2&offset=1')
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.data.map((e) => e.id)).toEqual(['element-3', 'element-4']);
    });

    it('should paginate with group permission filtering', async () => {
      await repo(Group).save({ id: 'editors' });
      await repo(Block).save({ id: 'block-1' });
      await repo(Element).save({ id: 'element-1', parentId: 'block-1' });
      await repo(Element).save({ id: 'element-2', parentId: 'block-1' });
      await repo(Element).save({ id: 'element-3', parentId: 'block-1' });
      await repo(Element).save({ id: 'element-4', parentId: 'block-1' });
      await repo(Element4Permission).save({ parentId: 'element-1', method: PermissionMethod.READ });
      await repo(Element4Permission).save({ parentId: 'element-2', groupId: 'editors', method: PermissionMethod.READ });
      await repo(Element4Permission).save({ parentId: 'element-3', method: PermissionMethod.READ });
      await repo(Element4Permission).save({ parentId: 'element-4', groupId: 'editors', method: PermissionMethod.READ });

      const response = await request(app.getHttpServer())
        .get('/element?limit=2')
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.data.map((e) => e.id)).toEqual(['element-1', 'element-3']);
    });

    it('should paginate with group permission when user has matching group', async () => {
      await repo(Group).save({ id: 'editors' });
      await repo(Block).save({ id: 'block-1' });
      await repo(Element).save({ id: 'element-1', parentId: 'block-1' });
      await repo(Element).save({ id: 'element-2', parentId: 'block-1' });
      await repo(Element).save({ id: 'element-3', parentId: 'block-1' });
      await repo(Element).save({ id: 'element-4', parentId: 'block-1' });
      await repo(Element4Permission).save({ parentId: 'element-1', method: PermissionMethod.READ });
      await repo(Element4Permission).save({ parentId: 'element-2', groupId: 'editors', method: PermissionMethod.READ });
      await repo(Element4Permission).save({ parentId: 'element-3', method: PermissionMethod.READ });
      await repo(Element4Permission).save({ parentId: 'element-4', groupId: 'editors', method: PermissionMethod.READ });

      const token = jwtService.sign({ sub: 'user-1', groups: ['editors'] });

      const response = await request(app.getHttpServer())
        .get('/element?limit=2&offset=1')
        .set('Cookie', `auth_token=${token}`)
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.data.map((e) => e.id)).toEqual(['element-2', 'element-3']);
    });

    it('should return empty when offset exceeds filtered results', async () => {
      await repo(Block).save({ id: 'block-1' });
      await repo(Element).save({ id: 'element-1', parentId: 'block-1' });
      await repo(Element).save({ id: 'element-2', parentId: 'block-1' });
      await repo(Element).save({ id: 'element-3', parentId: 'block-1' });
      await repo(Element4Permission).save({ parentId: 'element-1', method: PermissionMethod.READ });

      const response = await request(app.getHttpServer())
        .get('/element?offset=5')
        .expect(200);

      expect(response.body.data).toEqual([]);
    });
  });

  describe('GET /element with filter', () => {
    beforeEach(async () => {
      await repo(Block).save({ id: 'block-1' });
      await repo(Attribute).save({ id: 'name' });
      await repo(Attribute).save({ id: 'price' });
      await repo(Attribute).save({ id: 'category' });
      await repo(Language).save({ id: 'en' });
      await repo(Language).save({ id: 'ru' });
      await repo(Directory).save({ id: 'categories' });
      await repo(Point).save({ id: 'coffee', directoryId: 'categories' });
      await repo(Point).save({ id: 'tea', directoryId: 'categories' });
    });

    describe('string filters', () => {
      it('should filter by string attribute with exact value', async () => {
        await repo(Element).save({ id: 'element-1', parentId: 'block-1' });
        await repo(Element).save({ id: 'element-2', parentId: 'block-1' });
        await repo(Element4Permission).save({ parentId: 'element-1', method: PermissionMethod.READ });
        await repo(Element4Permission).save({ parentId: 'element-2', method: PermissionMethod.READ });
        await repo(Element2String).save({ parentId: 'element-1', attributeId: 'name', value: 'Latte' });
        await repo(Element2String).save({
          parentId: 'element-2',
          attributeId: 'name',
          value: 'Espresso',
        });

        const response = await request(app.getHttpServer())
          .get('/element')
          .query({ 'string[0][attr]': 'name', 'string[0][value]': 'Latte' })
          .expect(200);

        expect(response.body.data).toHaveLength(1);
        expect(response.body.data[0].id).toBe('element-1');
      });

      it('should filter by string attribute with like pattern', async () => {
        await repo(Element).save({ id: 'element-1', parentId: 'block-1' });
        await repo(Element).save({ id: 'element-2', parentId: 'block-1' });
        await repo(Element).save({ id: 'element-3', parentId: 'block-1' });
        await repo(Element4Permission).save({ parentId: 'element-1', method: PermissionMethod.READ });
        await repo(Element4Permission).save({ parentId: 'element-2', method: PermissionMethod.READ });
        await repo(Element4Permission).save({ parentId: 'element-3', method: PermissionMethod.READ });
        await repo(Element2String).save({
          parentId: 'element-1',
          attributeId: 'name',
          value: 'Caffe Latte',
        });
        await repo(Element2String).save({
          parentId: 'element-2',
          attributeId: 'name',
          value: 'Vanilla Latte',
        });
        await repo(Element2String).save({ parentId: 'element-3', attributeId: 'name', value: 'Mocha' });

        const response = await request(app.getHttpServer())
          .get('/element')
          .query({ 'string[0][attr]': 'name', 'string[0][like]': 'Latte' })
          .expect(200);

        expect(response.body.data).toHaveLength(2);
        expect(response.body.data.map((e) => e.id).sort()).toEqual([
          'element-1',
          'element-2',
        ]);
      });

      it('should filter by string attribute with language', async () => {
        await repo(Element).save({ id: 'element-1', parentId: 'block-1' });
        await repo(Element).save({ id: 'element-2', parentId: 'block-1' });
        await repo(Element4Permission).save({ parentId: 'element-1', method: PermissionMethod.READ });
        await repo(Element4Permission).save({ parentId: 'element-2', method: PermissionMethod.READ });
        await repo(Element2String).save({
          parentId: 'element-1',
          attributeId: 'name',
          languageId: 'en',
          value: 'Coffee',
        });
        await repo(Element2String).save({
          parentId: 'element-1',
          attributeId: 'name',
          languageId: 'ru',
          value: 'Кофе',
        });
        await repo(Element2String).save({
          parentId: 'element-2',
          attributeId: 'name',
          languageId: 'ru',
          value: 'Чай',
        });

        const response = await request(app.getHttpServer())
          .get('/element')
          .query({
            'string[0][attr]': 'name',
            'string[0][lang]': 'en',
            'string[0][value]': 'Coffee',
          })
          .expect(200);

        expect(response.body.data).toHaveLength(1);
        expect(response.body.data[0].id).toBe('element-1');
      });
    });

    describe('point filters', () => {
      it('should filter by point attribute', async () => {
        await repo(Element).save({ id: 'element-1', parentId: 'block-1' });
        await repo(Element).save({ id: 'element-2', parentId: 'block-1' });
        await repo(Element).save({ id: 'element-3', parentId: 'block-1' });
        await repo(Element4Permission).save({ parentId: 'element-1', method: PermissionMethod.READ });
        await repo(Element4Permission).save({ parentId: 'element-2', method: PermissionMethod.READ });
        await repo(Element4Permission).save({ parentId: 'element-3', method: PermissionMethod.READ });
        await repo(Element2Point).save({ parentId: 'element-1', attributeId: 'category', pointId: 'coffee' });
        await repo(Element2Point).save({ parentId: 'element-2', attributeId: 'category', pointId: 'tea' });
        await repo(Element2Point).save({ parentId: 'element-3', attributeId: 'category', pointId: 'coffee' });

        const response = await request(app.getHttpServer())
          .get('/element')
          .query({ 'point[0][attr]': 'category', 'point[0][point]': 'coffee' })
          .expect(200);

        expect(response.body.data).toHaveLength(2);
        expect(response.body.data.map((e) => e.id).sort()).toEqual([
          'element-1',
          'element-3',
        ]);
      });
    });

    describe('counter filters', () => {
      it('should filter by counter with exact value', async () => {
        await repo(Element).save({ id: 'element-1', parentId: 'block-1' });
        await repo(Element).save({ id: 'element-2', parentId: 'block-1' });
        await repo(Element4Permission).save({ parentId: 'element-1', method: PermissionMethod.READ });
        await repo(Element4Permission).save({ parentId: 'element-2', method: PermissionMethod.READ });
        await repo(Element2Counter).save({ parentId: 'element-1', attributeId: 'price', count: 5.0 });
        await repo(Element2Counter).save({ parentId: 'element-2', attributeId: 'price', count: 10.0 });

        const response = await request(app.getHttpServer())
          .get('/element')
          .query({ 'counter[0][attr]': 'price', 'counter[0][eq]': '5' })
          .expect(200);

        expect(response.body.data).toHaveLength(1);
        expect(response.body.data[0].id).toBe('element-1');
      });

      it('should filter by counter with min value', async () => {
        await repo(Element).save({ id: 'element-1', parentId: 'block-1' });
        await repo(Element).save({ id: 'element-2', parentId: 'block-1' });
        await repo(Element).save({ id: 'element-3', parentId: 'block-1' });
        await repo(Element4Permission).save({ parentId: 'element-1', method: PermissionMethod.READ });
        await repo(Element4Permission).save({ parentId: 'element-2', method: PermissionMethod.READ });
        await repo(Element4Permission).save({ parentId: 'element-3', method: PermissionMethod.READ });
        await repo(Element2Counter).save({ parentId: 'element-1', attributeId: 'price', count: 5.0 });
        await repo(Element2Counter).save({ parentId: 'element-2', attributeId: 'price', count: 10.0 });
        await repo(Element2Counter).save({ parentId: 'element-3', attributeId: 'price', count: 15.0 });

        const response = await request(app.getHttpServer())
          .get('/element')
          .query({ 'counter[0][attr]': 'price', 'counter[0][min]': '10' })
          .expect(200);

        expect(response.body.data).toHaveLength(2);
        expect(response.body.data.map((e) => e.id).sort()).toEqual([
          'element-2',
          'element-3',
        ]);
      });

      it('should filter by counter with max value', async () => {
        await repo(Element).save({ id: 'element-1', parentId: 'block-1' });
        await repo(Element).save({ id: 'element-2', parentId: 'block-1' });
        await repo(Element).save({ id: 'element-3', parentId: 'block-1' });
        await repo(Element4Permission).save({ parentId: 'element-1', method: PermissionMethod.READ });
        await repo(Element4Permission).save({ parentId: 'element-2', method: PermissionMethod.READ });
        await repo(Element4Permission).save({ parentId: 'element-3', method: PermissionMethod.READ });
        await repo(Element2Counter).save({ parentId: 'element-1', attributeId: 'price', count: 5.0 });
        await repo(Element2Counter).save({ parentId: 'element-2', attributeId: 'price', count: 10.0 });
        await repo(Element2Counter).save({ parentId: 'element-3', attributeId: 'price', count: 15.0 });

        const response = await request(app.getHttpServer())
          .get('/element')
          .query({ 'counter[0][attr]': 'price', 'counter[0][max]': '10' })
          .expect(200);

        expect(response.body.data).toHaveLength(2);
        expect(response.body.data.map((e) => e.id).sort()).toEqual([
          'element-1',
          'element-2',
        ]);
      });

      it('should filter by counter with range (min and max)', async () => {
        await repo(Element).save({ id: 'element-1', parentId: 'block-1' });
        await repo(Element).save({ id: 'element-2', parentId: 'block-1' });
        await repo(Element).save({ id: 'element-3', parentId: 'block-1' });
        await repo(Element).save({ id: 'element-4', parentId: 'block-1' });
        await repo(Element4Permission).save({ parentId: 'element-1', method: PermissionMethod.READ });
        await repo(Element4Permission).save({ parentId: 'element-2', method: PermissionMethod.READ });
        await repo(Element4Permission).save({ parentId: 'element-3', method: PermissionMethod.READ });
        await repo(Element4Permission).save({ parentId: 'element-4', method: PermissionMethod.READ });
        await repo(Element2Counter).save({ parentId: 'element-1', attributeId: 'price', count: 3.0 });
        await repo(Element2Counter).save({ parentId: 'element-2', attributeId: 'price', count: 7.0 });
        await repo(Element2Counter).save({ parentId: 'element-3', attributeId: 'price', count: 12.0 });
        await repo(Element2Counter).save({ parentId: 'element-4', attributeId: 'price', count: 20.0 });

        const response = await request(app.getHttpServer())
          .get('/element')
          .query({
            'counter[0][attr]': 'price',
            'counter[0][min]': '5',
            'counter[0][max]': '15',
          })
          .expect(200);

        expect(response.body.data).toHaveLength(2);
        expect(response.body.data.map((e) => e.id).sort()).toEqual([
          'element-2',
          'element-3',
        ]);
      });
    });

    describe('combined filters', () => {
      it('should filter by multiple criteria (string and point)', async () => {
        await repo(Element).save({ id: 'element-1', parentId: 'block-1' });
        await repo(Element).save({ id: 'element-2', parentId: 'block-1' });
        await repo(Element).save({ id: 'element-3', parentId: 'block-1' });
        await repo(Element4Permission).save({ parentId: 'element-1', method: PermissionMethod.READ });
        await repo(Element4Permission).save({ parentId: 'element-2', method: PermissionMethod.READ });
        await repo(Element4Permission).save({ parentId: 'element-3', method: PermissionMethod.READ });
        await repo(Element2String).save({ parentId: 'element-1', attributeId: 'name', value: 'Premium Latte' });
        await repo(Element2String).save({ parentId: 'element-2', attributeId: 'name', value: 'Green Tea Latte' });
        await repo(Element2String).save({ parentId: 'element-3', attributeId: 'name', value: 'Black Coffee' });
        await repo(Element2Point).save({ parentId: 'element-1', attributeId: 'category', pointId: 'coffee' });
        await repo(Element2Point).save({ parentId: 'element-2', attributeId: 'category', pointId: 'tea' });
        await repo(Element2Point).save({ parentId: 'element-3', attributeId: 'category', pointId: 'coffee' });

        const response = await request(app.getHttpServer())
          .get('/element')
          .query({
            'string[0][attr]': 'name',
            'string[0][like]': 'Latte',
            'point[0][attr]': 'category',
            'point[0][point]': 'coffee',
          })
          .expect(200);

        expect(response.body.data).toHaveLength(1);
        expect(response.body.data[0].id).toBe('element-1');
      });

      it('should filter by string, point, and counter', async () => {
        await repo(Element).save({ id: 'element-1', parentId: 'block-1' });
        await repo(Element).save({ id: 'element-2', parentId: 'block-1' });
        await repo(Element4Permission).save({ parentId: 'element-1', method: PermissionMethod.READ });
        await repo(Element4Permission).save({ parentId: 'element-2', method: PermissionMethod.READ });
        await repo(Element2String).save({ parentId: 'element-1', attributeId: 'name', value: 'Latte' });
        await repo(Element2String).save({ parentId: 'element-2', attributeId: 'name', value: 'Latte' });
        await repo(Element2Point).save({ parentId: 'element-1', attributeId: 'category', pointId: 'coffee' });
        await repo(Element2Point).save({ parentId: 'element-2', attributeId: 'category', pointId: 'coffee' });
        await repo(Element2Counter).save({ parentId: 'element-1', attributeId: 'price', count: 5.0 });
        await repo(Element2Counter).save({ parentId: 'element-2', attributeId: 'price', count: 15.0 });

        const response = await request(app.getHttpServer())
          .get('/element')
          .query({
            'string[0][attr]': 'name',
            'string[0][value]': 'Latte',
            'point[0][attr]': 'category',
            'point[0][point]': 'coffee',
            'counter[0][attr]': 'price',
            'counter[0][max]': '10',
          })
          .expect(200);

        expect(response.body.data).toHaveLength(1);
        expect(response.body.data[0].id).toBe('element-1');
      });

      it('should return empty array when no elements match all filters', async () => {
        await repo(Element).save({ id: 'element-1', parentId: 'block-1' });
        await repo(Element4Permission).save({ parentId: 'element-1', method: PermissionMethod.READ });
        await repo(Element2String).save({ parentId: 'element-1', attributeId: 'name', value: 'Latte' });
        await repo(Element2Point).save({ parentId: 'element-1', attributeId: 'category', pointId: 'tea' });

        const response = await request(app.getHttpServer())
          .get('/element')
          .query({
            'string[0][attr]': 'name',
            'string[0][value]': 'Latte',
            'point[0][attr]': 'category',
            'point[0][point]': 'coffee',
          })
          .expect(200);

        expect(response.body).toEqual({ data: [], count: 0 });
      });
    });
  });

  describe('GET /element with sort', () => {
    beforeEach(async () => {
      await repo(Block).save({ id: 'block-1' });
      await repo(Attribute).save({ id: 'name' });
      await repo(Language).save({ id: 'en' });
      await repo(Language).save({ id: 'ru' });
    });

    describe('date sorting', () => {
      it('should sort by createdAt ASC', async () => {
        await repo(Element).save({ id: 'element-2', parentId: 'block-1', createdAt: new Date('2024-01-02') });
        await repo(Element).save({ id: 'element-1', parentId: 'block-1', createdAt: new Date('2024-01-01') });
        await repo(Element).save({ id: 'element-3', parentId: 'block-1', createdAt: new Date('2024-01-03') });
        await repo(Element4Permission).save({ parentId: 'element-1', method: PermissionMethod.READ });
        await repo(Element4Permission).save({ parentId: 'element-2', method: PermissionMethod.READ });
        await repo(Element4Permission).save({ parentId: 'element-3', method: PermissionMethod.READ });

        const response = await request(app.getHttpServer())
          .get('/element?order=createdAt&orderDir=ASC')
          .expect(200);

        expect(response.body.data).toHaveLength(3);
        expect(response.body.data.map((e) => e.id)).toEqual([
          'element-1',
          'element-2',
          'element-3',
        ]);
      });

      it('should sort by createdAt DESC', async () => {
        await repo(Element).save({
          id: 'element-2',
          parentId: 'block-1',
          createdAt: new Date('2024-01-02'),
        });
        await repo(Element).save({
          id: 'element-1',
          parentId: 'block-1',
          createdAt: new Date('2024-01-01'),
        });
        await repo(Element).save({
          id: 'element-3',
          parentId: 'block-1',
          createdAt: new Date('2024-01-03'),
        });
        await repo(Element4Permission).save({ parentId: 'element-1', method: PermissionMethod.READ });
        await repo(Element4Permission).save({ parentId: 'element-2', method: PermissionMethod.READ });
        await repo(Element4Permission).save({ parentId: 'element-3', method: PermissionMethod.READ });

        const response = await request(app.getHttpServer())
          .get('/element?order=createdAt&orderDir=DESC')
          .expect(200);

        expect(response.body.data).toHaveLength(3);
        expect(response.body.data.map((e) => e.id)).toEqual([
          'element-3',
          'element-2',
          'element-1',
        ]);
      });

      it('should sort by updatedAt ASC', async () => {
        await repo(Element).save({
          id: 'element-2',
          parentId: 'block-1',
          updatedAt: new Date('2024-02-02'),
        });
        await repo(Element).save({
          id: 'element-1',
          parentId: 'block-1',
          updatedAt: new Date('2024-02-01'),
        });
        await repo(Element).save({
          id: 'element-3',
          parentId: 'block-1',
          updatedAt: new Date('2024-02-03'),
        });
        await repo(Element4Permission).save({ parentId: 'element-1', method: PermissionMethod.READ });
        await repo(Element4Permission).save({ parentId: 'element-2', method: PermissionMethod.READ });
        await repo(Element4Permission).save({ parentId: 'element-3', method: PermissionMethod.READ });

        const response = await request(app.getHttpServer())
          .get('/element?order=updatedAt&orderDir=ASC')
          .expect(200);

        expect(response.body.data).toHaveLength(3);
        expect(response.body.data.map((e) => e.id)).toEqual([
          'element-1',
          'element-2',
          'element-3',
        ]);
      });

      it('should sort by updatedAt DESC', async () => {
        await repo(Element).save({
          id: 'element-2',
          parentId: 'block-1',
          updatedAt: new Date('2024-02-02'),
        });
        await repo(Element).save({
          id: 'element-1',
          parentId: 'block-1',
          updatedAt: new Date('2024-02-01'),
        });
        await repo(Element).save({
          id: 'element-3',
          parentId: 'block-1',
          updatedAt: new Date('2024-02-03'),
        });
        await repo(Element4Permission).save({ parentId: 'element-1', method: PermissionMethod.READ });
        await repo(Element4Permission).save({ parentId: 'element-2', method: PermissionMethod.READ });
        await repo(Element4Permission).save({ parentId: 'element-3', method: PermissionMethod.READ });

        const response = await request(app.getHttpServer())
          .get('/element?order=updatedAt&orderDir=DESC')
          .expect(200);

        expect(response.body.data).toHaveLength(3);
        expect(response.body.data.map((e) => e.id)).toEqual([
          'element-3',
          'element-2',
          'element-1',
        ]);
      });

      it('should default to ASC when orderDir is not provided', async () => {
        await repo(Element).save({
          id: 'element-2',
          parentId: 'block-1',
          createdAt: new Date('2024-01-02'),
        });
        await repo(Element).save({
          id: 'element-1',
          parentId: 'block-1',
          createdAt: new Date('2024-01-01'),
        });
        await repo(Element4Permission).save({ parentId: 'element-1', method: PermissionMethod.READ });
        await repo(Element4Permission).save({ parentId: 'element-2', method: PermissionMethod.READ });

        const response = await request(app.getHttpServer())
          .get('/element?order=createdAt')
          .expect(200);

        expect(response.body.data).toHaveLength(2);
        expect(response.body.data.map((e) => e.id)).toEqual([
          'element-1',
          'element-2',
        ]);
      });
    });

    describe('string attribute sorting', () => {
      it('should sort by string attribute ASC', async () => {
        await repo(Element).save({ id: 'element-1', parentId: 'block-1' });
        await repo(Element).save({ id: 'element-2', parentId: 'block-1' });
        await repo(Element).save({ id: 'element-3', parentId: 'block-1' });
        await repo(Element4Permission).save({ parentId: 'element-1', method: PermissionMethod.READ });
        await repo(Element4Permission).save({ parentId: 'element-2', method: PermissionMethod.READ });
        await repo(Element4Permission).save({ parentId: 'element-3', method: PermissionMethod.READ });
        await repo(Element2String).save({ parentId: 'element-1', attributeId: 'name', value: 'Banana' });
        await repo(Element2String).save({ parentId: 'element-2', attributeId: 'name', value: 'Apple' });
        await repo(Element2String).save({ parentId: 'element-3', attributeId: 'name', value: 'Cherry' });

        const response = await request(app.getHttpServer())
          .get('/element?order=string:name&orderDir=ASC')
          .expect(200);

        expect(response.body.data).toHaveLength(3);
        expect(response.body.data.map((e) => e.id)).toEqual([
          'element-2',
          'element-1',
          'element-3',
        ]);
      });

      it('should sort by string attribute DESC', async () => {
        await repo(Element).save({ id: 'element-1', parentId: 'block-1' });
        await repo(Element).save({ id: 'element-2', parentId: 'block-1' });
        await repo(Element).save({ id: 'element-3', parentId: 'block-1' });
        await repo(Element4Permission).save({ parentId: 'element-1', method: PermissionMethod.READ });
        await repo(Element4Permission).save({ parentId: 'element-2', method: PermissionMethod.READ });
        await repo(Element4Permission).save({ parentId: 'element-3', method: PermissionMethod.READ });
        await repo(Element2String).save({ parentId: 'element-1', attributeId: 'name', value: 'Banana' });
        await repo(Element2String).save({ parentId: 'element-2', attributeId: 'name', value: 'Apple' });
        await repo(Element2String).save({ parentId: 'element-3', attributeId: 'name', value: 'Cherry' });

        const response = await request(app.getHttpServer())
          .get('/element?order=string:name&orderDir=DESC')
          .expect(200);

        expect(response.body.data).toHaveLength(3);
        expect(response.body.data.map((e) => e.id)).toEqual([
          'element-3',
          'element-1',
          'element-2',
        ]);
      });

      it('should sort by string attribute with specific language', async () => {
        await repo(Element).save({ id: 'element-1', parentId: 'block-1' });
        await repo(Element).save({ id: 'element-2', parentId: 'block-1' });
        await repo(Element).save({ id: 'element-3', parentId: 'block-1' });
        await repo(Element4Permission).save({ parentId: 'element-1', method: PermissionMethod.READ });
        await repo(Element4Permission).save({ parentId: 'element-2', method: PermissionMethod.READ });
        await repo(Element4Permission).save({ parentId: 'element-3', method: PermissionMethod.READ });
        await repo(Element2String).save({
          parentId: 'element-1',
          attributeId: 'name',
          languageId: 'en',
          value: 'Banana',
        });
        await repo(Element2String).save({
          parentId: 'element-1',
          attributeId: 'name',
          languageId: 'ru',
          value: 'Банан',
        });
        await repo(Element2String).save({
          parentId: 'element-2',
          attributeId: 'name',
          languageId: 'en',
          value: 'Apple',
        });
        await repo(Element2String).save({
          parentId: 'element-2',
          attributeId: 'name',
          languageId: 'ru',
          value: 'Яблоко',
        });
        await repo(Element2String).save({
          parentId: 'element-3',
          attributeId: 'name',
          languageId: 'en',
          value: 'Cherry',
        });
        await repo(Element2String).save({
          parentId: 'element-3',
          attributeId: 'name',
          languageId: 'ru',
          value: 'Вишня',
        });

        const response = await request(app.getHttpServer())
          .get('/element?order=string:name:en&orderDir=ASC')
          .expect(200);

        expect(response.body.data).toHaveLength(3);
        expect(response.body.data.map((e) => e.id)).toEqual([
          'element-2',
          'element-1',
          'element-3',
        ]);
      });

      it('should still return elements without the sort attribute', async () => {
        await repo(Element).save({ id: 'element-1', parentId: 'block-1' });
        await repo(Element).save({ id: 'element-2', parentId: 'block-1' });
        await repo(Element).save({ id: 'element-3', parentId: 'block-1' });
        await repo(Element4Permission).save({ parentId: 'element-1', method: PermissionMethod.READ });
        await repo(Element4Permission).save({ parentId: 'element-2', method: PermissionMethod.READ });
        await repo(Element4Permission).save({ parentId: 'element-3', method: PermissionMethod.READ });
        await repo(Element2String).save({ parentId: 'element-1', attributeId: 'name', value: 'Banana' });
        await repo(Element2String).save({ parentId: 'element-3', attributeId: 'name', value: 'Apple' });

        const response = await request(app.getHttpServer())
          .get('/element?order=string:name&orderDir=ASC')
          .expect(200);

        expect(response.body.data).toHaveLength(3);
        const ids = response.body.data.map((e) => e.id);
        expect(ids).toContain('element-1');
        expect(ids).toContain('element-2');
        expect(ids).toContain('element-3');
        const indexApple = ids.indexOf('element-3');
        const indexBanana = ids.indexOf('element-1');
        expect(indexApple).toBeLessThan(indexBanana);
      });
    });

    describe('sort with filter', () => {
      it('should apply both filter and sort', async () => {
        await repo(Directory).save({ id: 'categories' });
        await repo(Point).save({ id: 'coffee', directoryId: 'categories' });
        await repo(Attribute).save({ id: 'category' });

        await repo(Element).save({
          id: 'element-1',
          parentId: 'block-1',
          createdAt: new Date('2024-01-03'),
        });
        await repo(Element).save({
          id: 'element-2',
          parentId: 'block-1',
          createdAt: new Date('2024-01-01'),
        });
        await repo(Element).save({
          id: 'element-3',
          parentId: 'block-1',
          createdAt: new Date('2024-01-02'),
        });
        await repo(Element4Permission).save({ parentId: 'element-1', method: PermissionMethod.READ });
        await repo(Element4Permission).save({ parentId: 'element-2', method: PermissionMethod.READ });
        await repo(Element4Permission).save({ parentId: 'element-3', method: PermissionMethod.READ });
        await repo(Element2Point).save({
          parentId: 'element-1',
          attributeId: 'category',
          pointId: 'coffee',
        });
        await repo(Element2Point).save({
          parentId: 'element-2',
          attributeId: 'category',
          pointId: 'coffee',
        });

        const response = await request(app.getHttpServer())
          .get('/element')
          .query({
            'point[0][attr]': 'category',
            'point[0][point]': 'coffee',
            order: 'createdAt',
            orderDir: 'ASC',
          })
          .expect(200);

        expect(response.body.data).toHaveLength(2);
        expect(response.body.data.map((e) => e.id)).toEqual([
          'element-2',
          'element-1',
        ]);
      });
    });

    describe('sort with pagination', () => {
      it('should apply sort before pagination', async () => {
        await repo(Element).save({
          id: 'element-1',
          parentId: 'block-1',
          createdAt: new Date('2024-01-01'),
        });
        await repo(Element).save({
          id: 'element-2',
          parentId: 'block-1',
          createdAt: new Date('2024-01-02'),
        });
        await repo(Element).save({
          id: 'element-3',
          parentId: 'block-1',
          createdAt: new Date('2024-01-03'),
        });
        await repo(Element).save({
          id: 'element-4',
          parentId: 'block-1',
          createdAt: new Date('2024-01-04'),
        });
        await repo(Element4Permission).save({ parentId: 'element-1', method: PermissionMethod.READ });
        await repo(Element4Permission).save({ parentId: 'element-2', method: PermissionMethod.READ });
        await repo(Element4Permission).save({ parentId: 'element-3', method: PermissionMethod.READ });
        await repo(Element4Permission).save({ parentId: 'element-4', method: PermissionMethod.READ });

        const response = await request(app.getHttpServer())
          .get('/element?order=createdAt&orderDir=DESC&limit=2&offset=1')
          .expect(200);

        expect(response.body.data).toHaveLength(2);
        expect(response.body.data.map((e) => e.id)).toEqual([
          'element-3',
          'element-2',
        ]);
      });
    });
  });

  describe('GET /element/:id', () => {
    it('should return a single element with relations', async () => {
      await repo(Block).save({ id: 'block-1' });
      await repo(Element).save({ id: 'element-1', parentId: 'block-1' });
      await repo(Element4Permission).save({ parentId: 'element-1', method: PermissionMethod.READ });

      const response = await request(app.getHttpServer())
        .get('/element/element-1')
        .expect(200);

      expect(response.body.id).toBe('element-1');
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

    it('should return 404 for non-existent element', async () => {
      const response = await request(app.getHttpServer())
        .get('/element/non-existent-id')
        .expect(404);

      expect(response.body.message).toBe(
        'Element with id non-existent-id not found',
      );
      expect(response.body.details).toEqual({
        entity: 'Element',
        id: 'non-existent-id',
      });
    });

    it('should return 403 when no READ permission exists', async () => {
      await repo(Block).save({ id: 'block-1' });
      await repo(Element).save({ id: 'element-1', parentId: 'block-1' });

      const response = await request(app.getHttpServer())
        .get('/element/element-1')
        .expect(403);

      expect(response.body.message).toBe(
        'Permission denied: READ on Element with id element-1',
      );
    });
  });

  describe('PUT /element/:id', () => {
    it('should return 404 for non-existent element', async () => {
      const response = await request(app.getHttpServer())
        .put('/element/non-existent-id')
        .send({ parentId: 'block-1' })
        .expect(404);

      expect(response.body.message).toBe(
        'Element with id non-existent-id not found',
      );
      expect(response.body.details).toEqual({
        entity: 'Element',
        id: 'non-existent-id',
      });
    });

    it('should update and return the element', async () => {
      const blockRepo = repo(Block);
      await blockRepo.save({ id: 'block-1' });
      await blockRepo.save({ id: 'block-2' });
      await repo(Element).save({ id: 'element-1', parentId: 'block-1' });
      await repo(Element4Permission).save({ parentId: 'element-1', method: PermissionMethod.WRITE });

      const response = await request(app.getHttpServer())
        .put('/element/element-1')
        .send({ parentId: 'block-2' })
        .expect(200);

      expect(response.body.id).toBe('element-1');
      expect(response.body.parentId).toBe('block-2');
    });

    it('should return 403 when no WRITE permission exists', async () => {
      await repo(Block).save({ id: 'block-1' });
      await repo(Element).save({ id: 'element-1', parentId: 'block-1' });

      const response = await request(app.getHttpServer())
        .put('/element/element-1')
        .send({ parentId: 'block-1' })
        .expect(403);

      expect(response.body.message).toBe(
        'Permission denied: WRITE on Element with id element-1',
      );
    });

    it('should add new permissions without removing existing ones', async () => {
      await repo(Group).save({ id: 'admins' });
      await repo(Group).save({ id: 'editors' });
      await repo(Block).save({ id: 'block-1' });
      await repo(Element).save({ id: 'element-1', parentId: 'block-1' });
      await repo(Element4Permission).save({
        parentId: 'element-1',
        groupId: 'admins',
        method: PermissionMethod.READ,
      });
      await repo(Element4Permission).save({ parentId: 'element-1', method: PermissionMethod.WRITE });

      const response = await request(app.getHttpServer())
        .put('/element/element-1')
        .send({
          parentId: 'block-1',
          permissions: [
            { parentId: 'element-1', groupId: 'admins', method: 'READ' },
            { parentId: 'element-1', groupId: 'editors', method: 'READ' },
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
      await repo(Element).save({ id: 'element-1', parentId: 'block-1' });
      await repo(Element4Permission).save({
        parentId: 'element-1',
        groupId: 'admins',
        method: PermissionMethod.READ,
      });
      await repo(Element4Permission).save({
        parentId: 'element-1',
        groupId: 'editors',
        method: PermissionMethod.READ,
      });
      await repo(Element4Permission).save({ parentId: 'element-1', method: PermissionMethod.WRITE });

      const response = await request(app.getHttpServer())
        .put('/element/element-1')
        .send({
          parentId: 'block-1',
          permissions: [
            { parentId: 'element-1', groupId: 'admins', method: 'READ' },
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
      await repo(Element).save({ id: 'element-1', parentId: 'block-1' });
      const existingPerm = await repo(Element4Permission)
        .save({
          parentId: 'element-1',
          groupId: 'admins',
          method: PermissionMethod.READ,
        });
      await repo(Element4Permission).save({ parentId: 'element-1', method: PermissionMethod.WRITE });

      const response = await request(app.getHttpServer())
        .put('/element/element-1')
        .send({
          parentId: 'block-1',
          permissions: [
            { parentId: 'element-1', groupId: 'admins', method: 'READ' },
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

      const permAfter = await repo(Element4Permission)
        .findOne({
          where: {
            parentId: 'element-1',
            groupId: 'admins',
            method: PermissionMethod.READ,
          },
        });
      expect(permAfter.id).toBe(existingPerm.id);
    });
  });

  describe('DELETE /element/:id', () => {
    it('should return 404 for non-existent element', async () => {
      const response = await request(app.getHttpServer())
        .delete('/element/non-existent-id')
        .expect(404);

      expect(response.body.message).toBe(
        'Element with id non-existent-id not found',
      );
      expect(response.body.details).toEqual({
        entity: 'Element',
        id: 'non-existent-id',
      });
    });

    it('should delete the element', async () => {
      await repo(Block).save({ id: 'block-1' });
      await repo(Element).save({ id: 'element-1', parentId: 'block-1' });
      await repo(Element4Permission).save({ parentId: 'element-1', method: PermissionMethod.DELETE });

      await request(app.getHttpServer())
        .delete('/element/element-1')
        .expect(204);

      const found = await repo(Element)
        .findOne({ where: { id: 'element-1' } });
      expect(found).toBeNull();
    });

    it('should return 403 when no DELETE permission exists', async () => {
      await repo(Block).save({ id: 'block-1' });
      await repo(Element).save({ id: 'element-1', parentId: 'block-1' });

      const response = await request(app.getHttpServer())
        .delete('/element/element-1')
        .expect(403);

      expect(response.body.message).toBe(
        'Permission denied: DELETE on Element with id element-1',
      );
    });
  });

  describe('POST /element', () => {
    it('should create and return a new element', async () => {
      await repo(Block).save({ id: 'block-1' });

      const response = await request(app.getHttpServer())
        .post('/element')
        .send({ id: 'new-element', parentId: 'block-1' })
        .expect(201);

      expect(response.body.id).toBe('new-element');
      expect(response.body.parentId).toBe('block-1');
      expect(response.body.attributes).toEqual({
        strings: [],
        points: [],
        descriptions: [],
        counters: [],
        files: [],
      });

      const found = await repo(Element)
        .findOne({ where: { id: 'new-element' } });
      expect(found).not.toBeNull();
    });

    it('should create element with strings', async () => {
      await repo(Block).save({ id: 'block-1' });
      await repo(Attribute).save({ id: 'name' });

      const response = await request(app.getHttpServer())
        .post('/element')
        .send({
          id: 'new-element',
          parentId: 'block-1',
          strings: [{ attr: 'name', value: 'Test Element' }],
        })
        .expect(201);

      expect(response.body.id).toBe('new-element');
      expect(response.body.attributes.strings).toHaveLength(1);
      expect(response.body.attributes.strings[0]).toEqual({
        lang: null,
        attr: 'name',
        value: 'Test Element',
      });
    });

    it('should create element with descriptions', async () => {
      await repo(Block).save({ id: 'block-1' });
      await repo(Attribute).save({ id: 'content' });

      const response = await request(app.getHttpServer())
        .post('/element')
        .send({
          id: 'new-element',
          parentId: 'block-1',
          descriptions: [{ attr: 'content', value: 'Long description text' }],
        })
        .expect(201);

      expect(response.body.id).toBe('new-element');
      expect(response.body.attributes.descriptions).toHaveLength(1);
      expect(response.body.attributes.descriptions[0]).toEqual({
        lang: null,
        attr: 'content',
        value: 'Long description text',
      });
    });

    it('should create element with permissions', async () => {
      await repo(Block).save({ id: 'block-1' });
      await repo(Group).save({ id: 'admins' });

      const response = await request(app.getHttpServer())
        .post('/element')
        .send({
          id: 'new-element',
          parentId: 'block-1',
          permissions: [
            { parentId: 'new-element', groupId: 'admins', method: 'READ' },
          ],
        })
        .expect(201);

      expect(response.body.id).toBe('new-element');
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

    it('should create element with sections', async () => {
      await repo(Block).save({ id: 'block-1' });
      await repo(Section).save({ id: 'section-1', parentId: 'block-1' });

      const response = await request(app.getHttpServer())
        .post('/element')
        .send({
          id: 'new-element',
          parentId: 'block-1',
          sections: ['section-1'],
        })
        .expect(201);

      expect(response.body.id).toBe('new-element');
      expect(response.body.sections).toHaveLength(1);
      expect(response.body.sections[0]).toBe('section-1');
    });

    it('should return 400 when id is empty string', async () => {
      await repo(Block).save({ id: 'block-1' });

      const response = await request(app.getHttpServer())
        .post('/element')
        .send({ id: '', parentId: 'block-1' })
        .expect(400);

      expect(response.body.message).toBe('Database query failed');
    });
  });
});
