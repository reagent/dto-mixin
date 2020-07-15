import { NestFactory } from '@nestjs/core';
import { Connection, FindOneOptions } from 'typeorm';
import { truncateAll } from '../../test/util/database';

import { AppModule } from '../app.module';
import { UserService, DuplicateEmailsError } from './user.service';
import { User } from './user.entity';
import { Email } from '../emails/email.entity';
import { EntityNotFoundError } from 'typeorm/error/EntityNotFoundError';

// function last<T>(connection: Connection): Promise<T> {
//   return connection.manager.findOneOrFail<T>(T, undefined, {order: {createdAt: "DESC"}});
// }

function lastUser(
  connection: Connection,
  options: FindOneOptions<User> = {},
): Promise<User> {
  const defaultOptions: FindOneOptions<User> = { order: { createdAt: 'DESC' } };
  const finderOptions = { ...options, ...defaultOptions };

  return connection.manager.findOneOrFail<User>(User, undefined, finderOptions);
}

function createUser(
  connection: Connection,
  input: { name: string; emails?: string[] },
): Promise<User> {
  const user = connection.manager.create<User>(User, { name: input.name });

  if (input.emails) {
    user.emails = input.emails.map(a =>
      connection.manager.create<Email>(Email, { email: a }),
    );
  }

  return connection.manager.save(user);
}

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

  describe('show()', () => {
    it('throws an error when the user cannot be found', async () => {
      await expect(service.show(1)).rejects.toThrowError(EntityNotFoundError);
    });

    it('returns the serialized user', async () => {
      const existing = await createUser(connection, {
        name: 'Existing',
        emails: ['existing@host.example'],
      });

      const found = await service.show(existing.id);

      expect(found).toMatchObject({
        id: existing.id,
        name: 'Existing',
        emails: [{ email: 'existing@host.example' }],
      });
    });
  });

  describe('create()', () => {
    it('creates a new user without any emails', async () => {
      const created = await service.create({ name: 'Patrick' });

      expect(created.id).toBeDefined();

      expect(created).toMatchObject({
        name: 'Patrick',
        emails: [],
      });

      const emailCount = await connection.manager.count<Email>(Email);
      expect(emailCount).toEqual(0);
    });

    it('creates a new user with associated emails', async () => {
      await service.create({
        name: 'Patrick',
        emails: ['user@host.example'],
      });

      const created = await lastUser(connection, { relations: ['emails'] });

      expect(created.emails.length).toEqual(1);
      expect(created.emails[0].email).toEqual('user@host.example');
    });

    it('removes duplicate emails before saving', async () => {
      await service.create({
        name: 'Patrick',
        emails: ['user@host.example', 'user@host.example'],
      });

      const created = await lastUser(connection, { relations: ['emails'] });

      expect(created.emails.length).toEqual(1);
    });

    it('throws an error when the email address already exists', async () => {
      const address = 'user@host.example';

      await service.create({ name: 'Existing', emails: [address] });

      await expect(() =>
        service.create({ name: 'Patrick', emails: [address] }),
      ).rejects.toThrow(DuplicateEmailsError);
    });
  });

  describe('update()', () => {
    it('throws an error when the user cannot be found', async () => {
      await expect(service.update(1, { name: 'Patrick' })).rejects.toThrow(
        EntityNotFoundError,
      );
    });

    describe('with an existing user', () => {
      let existing: User;

      beforeEach(async () => {
        existing = await createUser(connection, { name: 'Existing' });
      });

      it('updates the name of the user', async () => {
        await service.update(existing.id, { name: 'Updated' });

        const updated = await connection.manager.findOneOrFail<User>(
          User,
          existing.id,
        );

        expect(updated.name).toEqual('Updated');
      });

      it('does not update the user when no attributes are provided', async () => {
        await service.update(existing.id, {});

        const updated = await connection.manager.findOneOrFail<User>(
          User,
          existing.id,
        );

        expect(updated.name).toEqual('Existing');
      });

      it('adds a new email address when provided', async () => {
        await service.update(existing.id, {
          emails: ['existing@host.example'],
        });

        const updated = await connection.manager.findOneOrFail<User>(
          User,
          existing.id,
          { relations: ['emails'] },
        );

        expect(updated.emails.length).toEqual(1);
        expect(updated.emails[0].email).toEqual('existing@host.example');
      });

      it('does not attempt to persist duplicate emails', async () => {
        const address = 'user@host.example';

        await service.update(existing.id, { emails: [address, address] });

        const updated = await connection.manager.findOneOrFail<User>(
          User,
          existing.id,
          { relations: ['emails'] },
        );

        expect(updated.emails.length).toEqual(1);
        expect(updated.emails[0].email).toEqual(address);
      });
    });

    describe('with a user with an associated email address', () => {
      let existing: User;
      const address = 'existing@host.example';

      beforeEach(async () => {
        existing = await createUser(connection, {
          name: 'Existing',
          emails: [address],
        });
      });

      it('does not replace the email addresses when none are provided', async () => {
        await service.update(existing.id, { name: 'Updated' });

        const updated = await connection.manager.findOneOrFail<User>(
          User,
          existing.id,
          { relations: ['emails'] },
        );

        expect(updated.emails.length).toEqual(1);
        expect(updated.emails[0].email).toEqual('existing@host.example');
      });

      it('removes all emails when given an empty array', async () => {
        await service.update(existing.id, { emails: [] });

        const updated = await connection.manager.findOneOrFail<User>(
          User,
          existing.id,
          { relations: ['emails'] },
        );

        expect(updated.emails).toEqual([]);

        const emailCount = await connection.manager.count<Email>(Email);
        expect(emailCount).toEqual(0);
      });

      it('replaces existing emails with new ones', async () => {
        await service.update(existing.id, {
          emails: ['updated@host.example'],
        });

        const updated = await connection.manager.findOneOrFail<User>(
          User,
          existing.id,
          { relations: ['emails'] },
        );

        expect(updated.emails.length).toEqual(1);
        expect(updated.emails[0].email).toEqual('updated@host.example');
      });
    });

    describe('with an existing email address belonging to another user', () => {
      const existingAddress = 'existing@host.example';
      const otherAddress = 'other@host.example';

      let existing: User;
      let other: User;

      beforeEach(async () => {
        existing = await createUser(connection, {
          name: 'Existing',
          emails: [existingAddress],
        });

        other = await createUser(connection, {
          name: 'Other',
          emails: [otherAddress],
        });
      });

      it('errors when provided a duplicate email and does not update the user', async () => {
        await expect(
          service.update(existing.id, {
            name: 'Updated',
            emails: [otherAddress],
          }),
        ).rejects.toThrow(DuplicateEmailsError);

        const updated = await connection.manager.findOne<User>(
          User,
          existing.id,
        );

        expect(updated.name).toEqual('Existing');
      });

      it('does not error when providing the same email belonging to the user', async () => {
        await expect(
          service.update(existing.id, {
            name: 'Updated',
            emails: [existingAddress],
          }),
        ).resolves.not.toThrow();

        const updated = await connection.manager.findOne<User>(
          User,
          existing.id,
          { relations: ['emails'] },
        );

        expect(updated.name).toEqual('Updated');
        expect(updated.emails.length).toEqual(1);
        expect(updated.emails[0].email).toEqual(existingAddress);
      });
    });
  });
});
