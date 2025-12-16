import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import * as request from 'supertest';
import { PointController } from './point.controller';
import { Point } from '../entities/point/point.entity';
import { Directory } from '../entities/directory/directory.entity';
import { Attribute } from '../../settings/entities/attribute/attribute.entity';
import { PointAttributeService } from '../../common/services/point-attribute.service';
import { StringAttributeService } from '../../common/services/string-attribute.service';
import { TestDbModule } from '../../tests/test-db.module';
import { ExceptionModule } from '../../exception/exception.module';

describe('PointController', () => {

  let app: INestApplication;
  let dataSource: DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TestDbModule,
        ExceptionModule,
        TypeOrmModule.forFeature([Point]),
      ],
      controllers: [PointController],
      providers: [
        PointAttributeService,
        StringAttributeService,
      ],
    }).compile();

    app = module.createNestApplication();
    dataSource = module.get<DataSource>(DataSource);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /point', () => {
    it('should return an empty array when no points exist', async () => {
      const response = await request(app.getHttpServer())
        .get('/point')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return an array of points with relations', async () => {
      const dirRepo = dataSource.getRepository(Directory);
      await dirRepo.save(dirRepo.create({ id: 'dir-1' }));

      const repo = dataSource.getRepository(Point);
      await repo.save(repo.create({ id: 'point-1', directoryId: 'dir-1' }));

      const response = await request(app.getHttpServer())
        .get('/point')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].id).toBe('point-1');
      expect(response.body[0].directoryId).toBe('dir-1');
      expect(response.body[0].attributes).toEqual({
        strings: [],
        points: [],
      });
    });
  });

  describe('GET /point/:id', () => {
    it('should return 404 for non-existent point', async () => {
      const response = await request(app.getHttpServer())
        .get('/point/non-existent-id')
        .expect(404);

      expect(response.body.message).toBe('Point with id non-existent-id not found');
      expect(response.body.details).toEqual({
        entity: 'Point',
        id: 'non-existent-id',
      });
    });

    it('should return a single point with relations', async () => {
      const dirRepo = dataSource.getRepository(Directory);
      await dirRepo.save(dirRepo.create({ id: 'dir-1' }));

      const repo = dataSource.getRepository(Point);
      await repo.save(repo.create({ id: 'point-1', directoryId: 'dir-1' }));

      const response = await request(app.getHttpServer())
        .get('/point/point-1')
        .expect(200);

      expect(response.body.id).toBe('point-1');
      expect(response.body.directoryId).toBe('dir-1');
      expect(response.body.attributes).toEqual({
        strings: [],
        points: [],
      });
    });
  });

  describe('POST /point', () => {
    it('should create and return a new point', async () => {
      const dirRepo = dataSource.getRepository(Directory);
      await dirRepo.save(dirRepo.create({ id: 'dir-1' }));

      const response = await request(app.getHttpServer())
        .post('/point')
        .send({ id: 'new-point', directoryId: 'dir-1' })
        .expect(201);

      expect(response.body.id).toBe('new-point');
      expect(response.body.directoryId).toBe('dir-1');
      expect(response.body.attributes).toEqual({
        strings: [],
        points: [],
      });

      const repo = dataSource.getRepository(Point);
      const found = await repo.findOne({ where: { id: 'new-point' } });
      expect(found).not.toBeNull();
    });

    it('should create point with strings', async () => {
      const dirRepo = dataSource.getRepository(Directory);
      await dirRepo.save(dirRepo.create({ id: 'dir-1' }));

      const attrRepo = dataSource.getRepository(Attribute);
      await attrRepo.save(attrRepo.create({ id: 'name' }));

      const response = await request(app.getHttpServer())
        .post('/point')
        .send({
          id: 'new-point',
          directoryId: 'dir-1',
          strings: [{ parentId: 'new-point', attributeId: 'name', value: 'Test Point' }],
        })
        .expect(201);

      expect(response.body.id).toBe('new-point');
      expect(response.body.attributes.strings).toHaveLength(1);
      expect(response.body.attributes.strings[0]).toEqual({
        lang: null,
        attr: 'name',
        value: 'Test Point',
      });
    });
  });

  describe('PUT /point/:id', () => {
    it('should return 404 for non-existent point', async () => {
      const response = await request(app.getHttpServer())
        .put('/point/non-existent-id')
        .send({ directoryId: 'dir-1' })
        .expect(404);

      expect(response.body.message).toBe('Point with id non-existent-id not found');
      expect(response.body.details).toEqual({
        entity: 'Point',
        id: 'non-existent-id',
      });
    });

    it('should update and return the point', async () => {
      const dirRepo = dataSource.getRepository(Directory);
      await dirRepo.save(dirRepo.create({ id: 'dir-1' }));
      await dirRepo.save(dirRepo.create({ id: 'dir-2' }));

      const repo = dataSource.getRepository(Point);
      await repo.save(repo.create({ id: 'point-1', directoryId: 'dir-1' }));

      const response = await request(app.getHttpServer())
        .put('/point/point-1')
        .send({ directoryId: 'dir-2' })
        .expect(200);

      expect(response.body.id).toBe('point-1');
      expect(response.body.directoryId).toBe('dir-2');
    });
  });

  describe('DELETE /point/:id', () => {
    it('should return 404 for non-existent point', async () => {
      const response = await request(app.getHttpServer())
        .delete('/point/non-existent-id')
        .expect(404);

      expect(response.body.message).toBe('Point with id non-existent-id not found');
      expect(response.body.details).toEqual({
        entity: 'Point',
        id: 'non-existent-id',
      });
    });

    it('should delete the point', async () => {
      const dirRepo = dataSource.getRepository(Directory);
      await dirRepo.save(dirRepo.create({ id: 'dir-1' }));

      const repo = dataSource.getRepository(Point);
      await repo.save(repo.create({ id: 'point-1', directoryId: 'dir-1' }));

      await request(app.getHttpServer())
        .delete('/point/point-1')
        .expect(200);

      const found = await repo.findOne({ where: { id: 'point-1' } });
      expect(found).toBeNull();
    });
  });

});
