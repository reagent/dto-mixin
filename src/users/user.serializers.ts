import { User as UserEntity } from './user.entity';
import { Email as EmailEntity } from '../emails/email.entity';

type Email = Pick<EmailEntity, 'id' | 'email'>;

type User = Pick<UserEntity, 'id' | 'name' | 'createdAt' | 'updatedAt'> & {
  emails: Email[];
};

// Object {
//   +   "__emails__": Array [],
//   +   "__has_emails__": true,
//       "createdAt": "2020-07-09T07:29:33.000Z",
//   -   "emails": Array [],
//       "id": 1,
//       "name": "Patrick",
//       "updatedAt": "2020-07-09T07:29:33.000Z",

class UserShow {
  constructor(private user: UserEntity) {}

  async json(): Promise<User> {
    const emails = (await this.user.emails).map(e => {
      return { id: e.id, email: e.email };
    });

    return {
      id: this.user.id,
      name: this.user.name,
      emails: emails,
      createdAt: this.user.createdAt,
      updatedAt: this.user.updatedAt,
    };
  }
}

export { User, UserShow };
