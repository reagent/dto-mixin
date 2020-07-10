import { serialize } from 'class-transformer';

import { User } from './user.serializers';
import { User as UserEntity } from './user.entity';

describe('User Serializer', () => {
  let entity: UserEntity;
  let subject: User;

  beforeEach(() => {
    entity = new UserEntity();
    subject = new User(entity);
  });

  it('default', () => {
    expect(JSON.parse(serialize(subject))).toEqual({});
  });

  // it('do', () => {
  //   // serialize({}, { excludeExtraneousValues: false });
  //   const entity = new UserEntity();
  //   entity.id = 1;
  //   // entity.name = 'omg';
  //   const subject = new User(entity);

  //   console.log(
  //     serialize(subject, {
  //       strategy: 'excludeAll',
  //       excludeExtraneousValues: false,
  //     }),
  //   );

  //   // const user = new UserEntity();
  //   // const subject = new UserShow(user);

  //   // expect(subject.toJSON()).toEqual({ key: 'value' });
  // });
});
