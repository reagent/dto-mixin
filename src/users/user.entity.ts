import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';

import { Email } from '../emails/email.entity';

@Entity('users')
class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  name: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(
    type => Email, // eslint-disable-line @typescript-eslint/no-unused-vars
    email => email.user,
    { cascade: true },
  )
  emails?: Email[];
}

class UserWithEmails extends User {
  emails: Email[];
}

export { User, UserWithEmails };
