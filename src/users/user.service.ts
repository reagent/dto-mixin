import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { User } from './user.entity';
import { Email } from '../emails/email.entity';
import { validate, ValidationError } from 'class-validator';

import * as Inputs from './user.inputs';
import * as Serializers from './user.serializers';
import { Serializer } from 'v8';
import { merge } from 'rxjs';
import { toSerializeAs } from 'test/matchers/serialize-as.matcher';

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

  show(id: string): Promise<Serializers.User> {
    return this.userRepository.findOneOrFail(id, { relations: ['emails'] });
  }

  // Some concerns here -- since there is no validation that gets triggered at
  // the service level, we need to rely on the validations on the input / entity
  // at the controller level.  Re-using this code outside of a controller
  // context should be encouraged, but could result in invalid data from the
  // application's perspective.
  async create(input: Inputs.Create): Promise<Serializers.User> {
    // TODO: do we validate here and return any errors to the caller? This would
    //       result in duplicate validations since they happen in the global
    //       validation pipe.

    // const errors = await validate(input);
    // if (errors.length > 0) {
    //   return errors;
    // }

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

    const reloaded = await this.userRepository.findOne(created.id, {
      relations: ['emails'],
    });

    return new Serializers.User(reloaded);
  }

  async update(id: number, input: Inputs.Update): Promise<Serializers.User> {
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

    const reloaded = await this.userRepository.findOneOrFail(user.id, {
      relations: ['emails'],
    });

    return new Serializers.User(reloaded);
  }
}

export { UserService, DuplicateEmailsError };
