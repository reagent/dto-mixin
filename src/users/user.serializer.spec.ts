import { User } from './user.serializers';
import { User as UserEntity } from './user.entity';

describe('User Serializer', () => {
  let entity: UserEntity;

  beforeEach(() => {
    entity = new UserEntity();
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
});
