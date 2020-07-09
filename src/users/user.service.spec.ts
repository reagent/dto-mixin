import { NestFactory } from '@nestjs/core';
import { Connection } from 'typeorm';
import { truncateAll } from '../../test/util/database';

import { AppModule } from '../app.module';
import { UserService, DuplicateEmailsError } from './user.service';
import { User } from './user.entity';

describe('UserService', () => {
  let service: UserService;
  let connection: Connection;

  beforeAll(async () => {
    const app = await NestFactory.create(AppModule, { logger: false });
    service = app.get(UserService);
    connection = app.get(Connection);
  });

  afterEach(async () => {
    await truncateAll(connection);
  });

  describe('create()', () => {
    it('creates a new user without any emails', async () => {
      const created = await service.create('Patrick', []);

      expect(created).toBeInstanceOf(User);
      expect(created.id).toBeDefined();
      expect(created.name).toEqual('Patrick');

      const emails = await created.emails;

      expect(emails.length).toEqual(0);
    });

    it('creates a new user with associated emails', async () => {
      const created = await service.create('Patrick', ['user@host.example']);

      expect(created).toBeInstanceOf(User);

      const emails = await created.emails;

      expect(emails.length).toEqual(1);
      expect(emails[0].email).toEqual('user@host.example');
    });

    it('removes duplicate emails before saving', async () => {
      const created = await service.create('Patrick', [
        'user@host.example',
        'user@host.example',
      ]);

      expect(created).toBeInstanceOf(User);

      const emails = await created.emails;

      expect(emails.length).toEqual(1);
    });

    it('throws an error when the email address already exists', async () => {
      const address = 'user@host.example';

      const existing = await service.create('Existing', [address]);

      await expect(() => service.create('Patrick', [address])).rejects.toThrow(
        DuplicateEmailsError,
      );
    });
  });
});
