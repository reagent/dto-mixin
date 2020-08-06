import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

import { User, UserWithEmails } from './user.entity';
import { Email } from '../emails/email.entity';

import * as Inputs from './user.inputs';

class DuplicateEmailsError extends Error {
  constructor() {
    super('Provided email addresses must be unique');
  }
}

class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Email) private emailRepository: Repository<Email>,
  ) {}

  async show(id: number): Promise<UserWithEmails> {
    return this.userRepository.findOneOrFail(id, {
      relations: ['emails'],
    }) as Promise<UserWithEmails>;
  }

  async create(input: Inputs.Create): Promise<UserWithEmails> {
    // Typically, validations are handled at the controller level -- this works
    // great in most cases, but prevents us from confidently using service
    // methods elsewhere in the application.  I've added validations here to
    // ensure that the code interacting with the database won't introduce data
    // integrity issues.
    //
    const errors = await validate(plainToClass(Inputs.Create, input));

    if (errors.length > 0) {
      throw new Error(errors.toString());
    }

    const uniqueAddresses = Array.from(new Set(input.emails));
    let created: User;

    await this.emailRepository.manager.transaction(async transaction => {
      const existing = await transaction.find<Email>(Email, {
        where: { email: uniqueAddresses },
      });

      if (existing.length > 0) {
        throw new DuplicateEmailsError();
      }

      created = this.userRepository.create({ name: input.name });

      created.emails = uniqueAddresses.map(address =>
        this.emailRepository.create({ email: address }),
      );

      // adding `{reload: false}` here throws
      //   QueryFailedError: SQLITE_CONSTRAINT: NOT NULL constraint failed: emails.user_id
      //
      await transaction.save<User>(created);
    });

    return this.userRepository.findOne(created.id, {
      relations: ['emails'],
    }) as Promise<UserWithEmails>;
  }

  async update(id: number, input: Inputs.Update): Promise<UserWithEmails> {
    const errors = await validate(plainToClass(Inputs.Update, input));

    if (errors.length > 0) {
      throw new Error(errors.toString());
    }

    const user = await this.userRepository.findOneOrFail(id);
    const merged = this.userRepository.merge(user, { name: input.name });

    await this.userRepository.manager.transaction(async transaction => {
      if (input.emails) {
        const uniqueAddresses = Array.from(new Set(input.emails));

        const count = await transaction.count<Email>(Email, {
          where: { email: uniqueAddresses, userId: Not(merged.id) },
        });

        if (count > 0) {
          throw new DuplicateEmailsError();
        }

        const emails = await transaction.find<Email>(Email, { user: merged });
        await transaction.remove(emails);

        merged.emails = uniqueAddresses.map(address =>
          this.emailRepository.create({ email: address }),
        );
      }

      await transaction.save(merged);
    });

    return this.userRepository.findOneOrFail(user.id, {
      relations: ['emails'],
    }) as Promise<UserWithEmails>;
  }
}

export { UserService, DuplicateEmailsError };
