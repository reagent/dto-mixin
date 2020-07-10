import { User as UserEntity } from './user.entity';
import { Email as EmailEntity } from '../emails/email.entity';
import { Expose, Type } from 'class-transformer';

// This shim is required in test only to prevent this error:
//  FAIL  src/users/user.serializer.spec.ts
//  ● Test suite failed to run
//
//    TypeError: Reflect.getMetadata is not a function
//
//      at decorators.ts:27:39
//      at __decorate (users/user.serializers.ts:5:110)
//      at Object.<anonymous> (users/user.serializers.ts:32:3)
//      at Object.<anonymous> (users/user.serializer.spec.ts:3:1)
//
import 'reflect-metadata';

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
