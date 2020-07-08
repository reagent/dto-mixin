import * as request from 'supertest';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { initialize } from '../src/initialize';
import { Connection } from 'typeorm';
import { Repository } from 'typeorm';
import { User } from '../src/users/user.entity';

describe('users', () => {
  let app: INestApplication;
  let connection: Connection;
  let repository: Repository<User>;

  beforeAll(async () => {
    app = await initialize();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    connection = app.get(Connection);
    repository = connection.manager.getRepository(User);
  });

  afterEach(async () => {
    for (const entity of connection.entityMetadatas) {
      const repository = await connection.getRepository(entity.name);
      // SQLite uses `DELETE FROM` instead of `TRUNCATE ... CASCADE;`
      await repository.query(`DELETE FROM ${entity.tableName}`);
    }
  });

  describe('POST /users', () => {
    it('missing name', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .expect(HttpStatus.BAD_REQUEST)
        .then(async response => {
          expect(response.body).toMatchObject({
            statusCode: HttpStatus.BAD_REQUEST,
            message: ['name should not be empty'],
            error: 'Bad Request',
          });

          expect(await repository.count()).toEqual(0);
        });
    });

    it('creates', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .send({ name: 'Patrick' })
        .expect(HttpStatus.CREATED)
        .then(async response => {
          const id = response.body.id;
          const created = await repository.findOne(id);

          expect(created).toBeInstanceOf(User);

          expect(response.body).toEqual({
            id: created.id,
            name: 'Patrick',
            createdAt: created.createdAt.toISOString(),
            updatedAt: created.updatedAt.toISOString(),
          });
        });
    });
  });
});
