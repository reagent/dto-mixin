import { User as UserEntity } from './user.entity';
import { Email as EmailEntity } from '../emails/email.entity';
import { Expose, Type } from 'class-transformer';

export class Email {
  @Expose()
  id: number;

  @Expose()
  email: string;

  constructor(entity: EmailEntity) {
    Object.assign(this, entity);
  }
}

export class User {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  // if not set on input entity, this key won't appear in serialized output,
  // this should always be defined, but leaving this here for now to document
  // this behavior
  createdAt: Date | null = null;

  @Expose()
  updatedAt: Date | null = null;

  @Expose()
  @Type(() => Email)
  emails: Email[] = [];

  constructor(entity: UserEntity) {
    // properties that are not set on the entity will not appear in the
    // serialized object
    Object.assign(this, entity);
  }
}
