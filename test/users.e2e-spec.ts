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
    it('responds with a 400 status and error message when the request fails', async () => {
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

    it('creates a new user when given a valid payload', async () => {
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

  describe('PUT /users/:id', () => {
    it('returns a 404 when the user does not exist', async () => {
      await request(app.getHttpServer())
        .put('/users/1')
        .send({ name: 'Patrick' })
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .expect(HttpStatus.NOT_FOUND)
        .then(response => {
          expect(response.body).toEqual({
            statusCode: HttpStatus.NOT_FOUND,
            message: `Could not find any entity of type "User" matching: "1"`,
          });
        });
    });

    it('updates the existing record', async () => {
      const user = repository.create({ name: 'Patrick' });
      await repository.save(user);

      expect(user.name).toEqual('Patrick');

      await request(app.getHttpServer())
        .put(`/users/${user.id}`)
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .send({ name: 'Updated' })
        .expect(HttpStatus.OK)
        .then(response => {
          expect(response.body).toEqual({
            id: user.id,
            name: 'Updated',
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
          });
        });

      const updated = await repository.findOneOrFail(user.id);
      expect(updated.name).toEqual('Updated');
    });
  });
});
