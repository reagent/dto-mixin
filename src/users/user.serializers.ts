import { UserWithEmails } from './user.entity';
import { Email as EmailEntity } from '../emails/email.entity';
import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class Email {
  @Expose()
  @ApiProperty({ example: 1 })
  id: number;

  @Expose()
  @ApiProperty({ example: 'user@host.example' })
  email: string;

  constructor(entity: EmailEntity) {
    Object.assign(this, entity);
  }
}

export class User {
  @Expose()
  @ApiProperty({ example: 1 })
  id: number;

  @Expose()
  @ApiProperty({ example: 'John' })
  name: string;

  @Expose()
  @ApiProperty()
  // if not set on input entity, this key won't appear in serialized output,
  // this should always be defined, but leaving this here for now to document
  // this behavior
  createdAt: Date | null = null;

  @Expose()
  @ApiProperty()
  updatedAt: Date | null = null;

  @Expose()
  @ApiProperty({ type: Email, isArray: true })
  @Type(() => Email)
  emails: Email[] = [];

  constructor(entity: UserWithEmails) {
    // properties that are not set on the entity will not appear in the
    // serialized object
    Object.assign(this, entity);
  }
}
