import * as request from 'supertest';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Connection, Repository } from 'typeorm';

import { truncateAll } from './util/database';

import { initialize } from '../src/initialize';
import { User } from '../src/users/user.entity';
import { Email } from '../src/emails/email.entity';
import { UserService } from '../src/users/user.service';

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
    await truncateAll(connection);
  });

  describe('GET /users/:id', () => {
    it('responds with a 404 when the user does not exist', async () => {
      await request(app.getHttpServer())
        .get('/users/1')
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .expect(HttpStatus.NOT_FOUND)
        .then(response =>
          expect(response.body).toEqual({
            statusCode: HttpStatus.NOT_FOUND,
            message: `Could not find any entity of type "User" matching: 1`,
          }),
        );
    });

    it('returns the matching user entity and associated emails', async () => {
      const user = repository.create({ name: 'Existing' });
      await repository.save(user);

      const email = connection.manager.create<Email>(Email, {
        email: 'user@host.example',
        userId: user.id,
      });
      await connection.manager.save(email);

      await request(app.getHttpServer())
        .get(`/users/${user.id}`)
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .expect(HttpStatus.OK)
        .then(response =>
          expect(response.body).toStrictEqual({
            id: user.id,
            name: 'Existing',
            emails: [{ id: email.id, email: email.email }],
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
          }),
        );
    });
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

          // Want to be explicit about asserting this response body so that
          // other entity / DTO properties don't come through
          expect(response.body).toEqual({
            id: created.id,
            name: 'Patrick',
            emails: [],
            createdAt: created.createdAt.toISOString(),
            updatedAt: created.updatedAt.toISOString(),
          });
        });
    });

    it('creates the user and an associated email address', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .send({
          name: 'Patrick',
          emails: ['user@host.example'],
        })
        .expect(HttpStatus.CREATED)
        .then(async response => {
          const created = await repository.findOneOrFail(response.body.id);
          expect(created).toBeInstanceOf(User);

          expect(response.body.emails).toEqual(
            expect.arrayContaining([
              expect.objectContaining({ email: 'user@host.example' }),
            ]),
          );
        });
    });

    it('returns an error and does not save the user when there is a duplicate email address', async () => {
      const address = 'user@host.example';

      const service = app.get(UserService);
      await service.create({ name: 'Existing', emails: [address] });

      const initialCount = await repository.count();

      await request(app.getHttpServer())
        .post('/users')
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .send({ name: 'Patrick', emails: [address] })
        .expect(HttpStatus.UNPROCESSABLE_ENTITY)
        .then(async response => {
          expect(await repository.count()).toEqual(initialCount);

          expect(response.body).toEqual({
            statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
            message: 'Provided email addresses must be unique',
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
            message: `Could not find any entity of type "User" matching: 1`,
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
            emails: [],
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
          });
        });

      const updated = await repository.findOneOrFail(user.id);
      expect(updated.name).toEqual('Updated');
    });
  });
});
