import { User } from './user.serializers';
import { UserWithEmails } from './user.entity';
import { Email as EmailEntity } from '../emails/email.entity';

describe('User Serializer', () => {
  let entity: UserWithEmails;

  beforeEach(() => {
    entity = new UserWithEmails();
  });

  it('serializes the default values', () => {
    const subject = new User(entity);

    expect(subject).toSerializeAs({
      emails: [],
      createdAt: null,
      updatedAt: null,
    });
  });

  it('contains additional fields from the underlying entity', () => {
    const now = new Date();

    entity.id = 1;
    entity.name = 'Name';
    entity.createdAt = now;
    entity.updatedAt = now;

    const subject = new User(entity);

    expect(subject).toSerializeAs({
      id: 1,
      name: 'Name',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      emails: [],
    });
  });

  it('includes emails', () => {
    const now = new Date();

    entity.id = 1;
    entity.name = 'Name';
    entity.createdAt = now;
    entity.updatedAt = now;

    const email = new EmailEntity();
    email.id = 1;
    email.email = 'user@host.com';

    entity.emails = [email];

    const subject = new User(entity);

    expect(subject).toSerializeAs({
      id: 1,
      name: 'Name',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      emails: [{ id: 1, email: 'user@host.com' }],
    });
  });
});
