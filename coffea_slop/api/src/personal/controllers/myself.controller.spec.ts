import {Test, TestingModule} from '@nestjs/testing';
import {INestApplication} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {JwtModule} from '@nestjs/jwt';
import {DataSource} from 'typeorm';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';
import {MyselfController} from './myself.controller';
import {AuthCookieService} from '../services/auth-cookie.service';
import {User} from '../entities/user/user.entity';
import {User2Counter} from '../entities/user/user2counter.entity';
import {Attribute} from '../../settings/entities/attribute/attribute.entity';
import {Language} from '../../settings/entities/language/language.entity';
import {Directory} from '../../registry/entities/directory/directory.entity';
import {Point} from '../../registry/entities/point/point.entity';
import {Measure} from '../../registry/entities/measure/measure.entity';
import {TestDbModule} from '../../tests/test-db.module';
import {ExceptionModule} from '../../exception/exception.module';
import {CommonModule} from '../../common/common.module';

describe('MyselfController', () => {
  let app: INestApplication;
  let ds: DataSource;
  let authCookieService: AuthCookieService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TestDbModule,
        ExceptionModule,
        CommonModule,
        TypeOrmModule.forFeature([User]),
        JwtModule.register({
          secret: 'test-secret',
          signOptions: { expiresIn: '7d' },
        }),
      ],
      controllers: [MyselfController],
      providers: [AuthCookieService],
    }).compile();

    app = module.createNestApplication();
    app.use(cookieParser());
    ds = module.get<DataSource>(DataSource);
    authCookieService = module.get<AuthCookieService>(AuthCookieService);

    await app.init();
  });

  afterEach(() => app.close());

  describe('GET /myself', () => {
    it('should return 403 when not authenticated', async () => {
      const response = await request(app.getHttpServer())
        .get('/myself')
        .expect(403);

      expect(response.body.message).toContain('Permission denied');
    });

    it('should return 403 when user not found', async () => {
      const cookie = authCookieService.createAuthCookie('non-existent-user');

      const response = await request(app.getHttpServer())
        .get('/myself')
        .set('Cookie', cookie)
        .expect(403);

      expect(response.body.message).toContain('Permission denied');
    });

    it('should return 403 when token is expired', async () => {
      await ds
        .getRepository(User)
        .create({ id: 'user-1', login: 'testuser' })
        .save();

      const cookie = authCookieService.createExpiredAuthCookie('user-1');

      const response = await request(app.getHttpServer())
        .get('/myself')
        .set('Cookie', cookie)
        .expect(403);

      expect(response.body.message).toContain('Permission denied');
    });

    it('should return current user with relations', async () => {
      await ds
        .getRepository(User)
        .create({ id: 'user-1', login: 'testuser' })
        .save();

      const cookie = authCookieService.createAuthCookie('user-1', 'testuser');

      const response = await request(app.getHttpServer())
        .get('/myself')
        .set('Cookie', cookie)
        .expect(200);

      expect(response.body.id).toBe('user-1');
      expect(response.body.login).toBe('testuser');
      expect(response.body.attributes).toEqual({
        strings: [],
        points: [],
        descriptions: [],
        counters: [],
      });
    });
  });

  describe('POST /myself', () => {
    it('should return 400 when password is missing', async () => {
      const response = await request(app.getHttpServer())
        .post('/myself')
        .send({ id: 'new-user', login: 'newuser' })
        .expect(400);

      expect(response.body.message).toBe('Password is required');
      expect(response.body.details.field).toBe('password');
    });

    it('should register a new user and return it', async () => {
      const response = await request(app.getHttpServer())
        .post('/myself')
        .send({ id: 'new-user', login: 'newuser', password: 'password123' })
        .expect(201);

      expect(response.body.id).toBe('new-user');
      expect(response.body.login).toBe('newuser');
      expect(response.body.attributes).toEqual({
        strings: [],
        points: [],
        descriptions: [],
        counters: [],
      });

      // Should set auth cookie
      expect(response.headers['set-cookie']).toBeDefined();
      expect(response.headers['set-cookie'][0]).toContain('auth_token=');

      const repo = ds.getRepository(User);
      const found = await repo.findOne({ where: { id: 'new-user' } });
      expect(found).not.toBeNull();
    });

    it('should register user with email and phone', async () => {
      const response = await request(app.getHttpServer())
        .post('/myself')
        .send({
          id: 'new-user-2',
          login: 'newuser',
          password: 'password123',
          email: 'test@example.com',
          phone: '+1234567890',
        })
        .expect(201);

      expect(response.body.login).toBe('newuser');
      expect(response.body.email).toBe('test@example.com');
      expect(response.body.phone).toBe('+1234567890');
    });

    it('should register user with strings', async () => {
      await ds.getRepository(Attribute).create({ id: 'name' }).save();

      const response = await request(app.getHttpServer())
        .post('/myself')
        .send({
          id: 'new-user-3',
          login: 'newuser',
          password: 'password123',
          strings: [{ attr: 'name', value: 'John Doe' }],
        })
        .expect(201);

      expect(response.body.login).toBe('newuser');
      expect(response.body.attributes.strings).toHaveLength(1);
      expect(response.body.attributes.strings[0]).toEqual({
        lang: null,
        attr: 'name',
        value: 'John Doe',
      });
    });

    it('should register user with points', async () => {
      await ds.getRepository(Attribute).create({ id: 'location' }).save();
      await ds.getRepository(Directory).create({ id: 'cities' }).save();
      await ds
        .getRepository(Point)
        .create({ id: 'city-1', directoryId: 'cities' })
        .save();

      const response = await request(app.getHttpServer())
        .post('/myself')
        .send({
          id: 'new-user-4',
          login: 'newuser',
          password: 'password123',
          points: [{ attr: 'location', pnt: 'city-1' }],
        })
        .expect(201);

      expect(response.body.login).toBe('newuser');
      expect(response.body.attributes.points).toHaveLength(1);
      expect(response.body.attributes.points[0]).toEqual({
        attr: 'location',
        pnt: 'city-1',
      });
    });

    it('should register user with descriptions', async () => {
      await ds.getRepository(Attribute).create({ id: 'bio' }).save();
      await ds.getRepository(Language).create({ id: 'en' }).save();

      const response = await request(app.getHttpServer())
        .post('/myself')
        .send({
          id: 'new-user-5',
          login: 'newuser',
          password: 'password123',
          descriptions: [{ attr: 'bio', lang: 'en', value: 'My biography' }],
        })
        .expect(201);

      expect(response.body.login).toBe('newuser');
      expect(response.body.attributes.descriptions).toHaveLength(1);
      expect(response.body.attributes.descriptions[0]).toEqual({
        lang: 'en',
        attr: 'bio',
        value: 'My biography',
      });
    });

    it('should register user with counters', async () => {
      await ds.getRepository(Attribute).create({ id: 'age' }).save();

      const response = await request(app.getHttpServer())
        .post('/myself')
        .send({
          id: 'new-user-6',
          login: 'newuser',
          password: 'password123',
          counters: [{ attr: 'age', count: 25 }],
        })
        .expect(201);

      expect(response.body.login).toBe('newuser');
      expect(response.body.attributes.counters).toHaveLength(1);
      expect(response.body.attributes.counters[0]).toEqual({
        attr: 'age',
        pnt: null,
        msr: null,
        count: 25,
      });
    });

    it('should register user with counters with point and measure', async () => {
      await ds.getRepository(Attribute).create({ id: 'score' }).save();
      await ds.getRepository(Directory).create({ id: 'categories' }).save();
      await ds
        .getRepository(Point)
        .create({ id: 'category-1', directoryId: 'categories' })
        .save();
      await ds.getRepository(Measure).create({ id: 'points' }).save();

      const response = await request(app.getHttpServer())
        .post('/myself')
        .send({
          id: 'new-user-7',
          login: 'newuser',
          password: 'password123',
          counters: [
            { attr: 'score', pnt: 'category-1', msr: 'points', count: 100 },
          ],
        })
        .expect(201);

      expect(response.body.login).toBe('newuser');
      expect(response.body.attributes.counters).toHaveLength(1);
      expect(response.body.attributes.counters[0]).toEqual({
        attr: 'score',
        pnt: 'category-1',
        msr: 'points',
        count: 100,
      });
    });
  });

  describe('PUT /myself', () => {
    it('should return 403 when not authenticated', async () => {
      const response = await request(app.getHttpServer())
        .put('/myself')
        .send({})
        .expect(403);

      expect(response.body.message).toContain('Permission denied');
    });

    it('should return 403 when user not found', async () => {
      const cookie = authCookieService.createAuthCookie('non-existent-user');

      const response = await request(app.getHttpServer())
        .put('/myself')
        .set('Cookie', cookie)
        .send({})
        .expect(403);

      expect(response.body.message).toContain('Permission denied');
    });

    it('should update current user', async () => {
      await ds
        .getRepository(User)
        .create({ id: 'user-1', login: 'test-user' })
        .save();

      const cookie = authCookieService.createAuthCookie('user-1', 'test-user');

      const response = await request(app.getHttpServer())
        .put('/myself')
        .set('Cookie', cookie)
        .send({ email: 'updated@example.com' })
        .expect(200);

      expect(response.body.id).toBe('user-1');
      expect(response.body.email).toBe('updated@example.com');
    });

    it('should update current user with phone', async () => {
      await ds
        .getRepository(User)
        .create({ id: 'user-1', login: 'test-user' })
        .save();

      const cookie = authCookieService.createAuthCookie('user-1', 'test-user');

      const response = await request(app.getHttpServer())
        .put('/myself')
        .set('Cookie', cookie)
        .send({ phone: '+9876543210' })
        .expect(200);

      expect(response.body.id).toBe('user-1');
      expect(response.body.phone).toBe('+9876543210');
    });

    it('should update current user with strings', async () => {
      await ds
        .getRepository(User)
        .create({ id: 'user-1', login: 'test-user' })
        .save();
      await ds.getRepository(Attribute).create({ id: 'bio' }).save();

      const cookie = authCookieService.createAuthCookie('user-1', 'test-user');

      const response = await request(app.getHttpServer())
        .put('/myself')
        .set('Cookie', cookie)
        .send({
          strings: [{ attr: 'bio', value: 'My bio' }],
        })
        .expect(200);

      expect(response.body.id).toBe('user-1');
      expect(response.body.attributes.strings).toHaveLength(1);
      expect(response.body.attributes.strings[0]).toEqual({
        lang: null,
        attr: 'bio',
        value: 'My bio',
      });
    });

    it('should add counter when not exists', async () => {
      await ds
        .getRepository(User)
        .create({ id: 'user-1', login: 'test-user' })
        .save();
      await ds.getRepository(Attribute).create({ id: 'age' }).save();

      const cookie = authCookieService.createAuthCookie('user-1', 'test-user');

      const response = await request(app.getHttpServer())
        .put('/myself')
        .set('Cookie', cookie)
        .send({ counters: [{ attr: 'age', count: 30 }] })
        .expect(200);

      expect(response.body.attributes.counters).toHaveLength(1);
      expect(response.body.attributes.counters[0]).toEqual({
        attr: 'age',
        pnt: null,
        msr: null,
        count: 30,
      });
    });

    it('should update counter when count changes', async () => {
      await ds
        .getRepository(User)
        .create({ id: 'user-1', login: 'test-user' })
        .save();
      await ds.getRepository(Attribute).create({ id: 'age' }).save();
      await ds
        .getRepository(User2Counter)
        .create({ parentId: 'user-1', attributeId: 'age', count: 25 })
        .save();

      const cookie = authCookieService.createAuthCookie('user-1', 'test-user');

      const response = await request(app.getHttpServer())
        .put('/myself')
        .set('Cookie', cookie)
        .send({ counters: [{ attr: 'age', count: 30 }] })
        .expect(200);

      expect(response.body.attributes.counters).toHaveLength(1);
      expect(response.body.attributes.counters[0].count).toBe(30);

      const counters = await ds
        .getRepository(User2Counter)
        .find({ where: { parentId: 'user-1' } });
      expect(counters).toHaveLength(1);
    });

    it('should delete counter when not in input', async () => {
      await ds
        .getRepository(User)
        .create({ id: 'user-1', login: 'test-user' })
        .save();
      await ds.getRepository(Attribute).create({ id: 'age' }).save();
      await ds
        .getRepository(User2Counter)
        .create({ parentId: 'user-1', attributeId: 'age', count: 25 })
        .save();

      const cookie = authCookieService.createAuthCookie('user-1', 'test-user');

      const response = await request(app.getHttpServer())
        .put('/myself')
        .set('Cookie', cookie)
        .send({ counters: [] })
        .expect(200);

      expect(response.body.attributes.counters).toHaveLength(0);

      const counters = await ds
        .getRepository(User2Counter)
        .find({ where: { parentId: 'user-1' } });
      expect(counters).toHaveLength(0);
    });

    it('should not change counter when values are same', async () => {
      await ds
        .getRepository(User)
        .create({ id: 'user-1', login: 'test-user' })
        .save();
      await ds.getRepository(Attribute).create({ id: 'age' }).save();
      const original = await ds
        .getRepository(User2Counter)
        .create({ parentId: 'user-1', attributeId: 'age', count: 25 })
        .save();

      const cookie = authCookieService.createAuthCookie('user-1', 'test-user');

      const response = await request(app.getHttpServer())
        .put('/myself')
        .set('Cookie', cookie)
        .send({ counters: [{ attr: 'age', count: 25 }] })
        .expect(200);

      expect(response.body.attributes.counters).toHaveLength(1);
      expect(response.body.attributes.counters[0].count).toBe(25);

      const counters = await ds
        .getRepository(User2Counter)
        .find({ where: { parentId: 'user-1' } });
      expect(counters).toHaveLength(1);
      expect(counters[0].id).toBe(original.id);
    });

    it('should update counter measure', async () => {
      await ds
        .getRepository(User)
        .create({ id: 'user-1', login: 'test-user' })
        .save();
      await ds.getRepository(Attribute).create({ id: 'score' }).save();
      await ds.getRepository(Measure).create({ id: 'points' }).save();
      await ds
        .getRepository(User2Counter)
        .create({ parentId: 'user-1', attributeId: 'score', count: 100 })
        .save();

      const cookie = authCookieService.createAuthCookie('user-1', 'test-user');

      const response = await request(app.getHttpServer())
        .put('/myself')
        .set('Cookie', cookie)
        .send({ counters: [{ attr: 'score', msr: 'points', count: 100 }] })
        .expect(200);

      expect(response.body.attributes.counters).toHaveLength(1);
      expect(response.body.attributes.counters[0]).toEqual({
        attr: 'score',
        pnt: null,
        msr: 'points',
        count: 100,
      });
    });

    it('should handle mixed counter operations', async () => {
      await ds
        .getRepository(User)
        .create({ id: 'user-1', login: 'test-user' })
        .save();
      await ds.getRepository(Attribute).create({ id: 'age' }).save();
      await ds.getRepository(Attribute).create({ id: 'score' }).save();
      await ds.getRepository(Attribute).create({ id: 'level' }).save();
      await ds
        .getRepository(User2Counter)
        .create({ parentId: 'user-1', attributeId: 'age', count: 25 })
        .save();
      await ds
        .getRepository(User2Counter)
        .create({ parentId: 'user-1', attributeId: 'score', count: 100 })
        .save();

      const cookie = authCookieService.createAuthCookie('user-1', 'test-user');

      const response = await request(app.getHttpServer())
        .put('/myself')
        .set('Cookie', cookie)
        .send({
          counters: [
            { attr: 'age', count: 25 },
            { attr: 'score', count: 150 },
            { attr: 'level', count: 5 },
          ],
        })
        .expect(200);

      expect(response.body.attributes.counters).toHaveLength(3);

      const counters = await ds
        .getRepository(User2Counter)
        .find({ where: { parentId: 'user-1' } });
      expect(counters).toHaveLength(3);

      const ageCounter = counters.find((c) => c.attributeId === 'age');
      const scoreCounter = counters.find((c) => c.attributeId === 'score');
      const levelCounter = counters.find((c) => c.attributeId === 'level');

      expect(ageCounter.count).toBe(25);
      expect(scoreCounter.count).toBe(150);
      expect(levelCounter.count).toBe(5);
    });
  });
});
