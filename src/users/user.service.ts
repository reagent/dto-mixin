import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { Email } from '../emails/email.entity';

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

  // Some concerns here -- since there is no validation that gets triggered at
  // the service level, we need to rely on the validations on the input / entity
  // at the controller level.  Re-using this code outside of a controller
  // context should be encouraged, but could result in invalid data from the
  // application's perspective.
  async create(name: string, emailAddresses: string[]): Promise<User> {
    const uniqueAddresses = Array.from(new Set(emailAddresses));
    let created: User;

    await this.emailRepository.manager.transaction(async transaction => {
      const existing = await transaction.find<Email>(Email, {
        where: { email: uniqueAddresses },
      });

      if (existing.length > 0) {
        throw new DuplicateEmailsError();
      }

      created = this.userRepository.create({ name: name });
      created.emails = uniqueAddresses.map(address => {
        return this.emailRepository.create({ email: address });
      });

      await transaction.save<User>(created, { reload: true });
    });

    return created;
  }
}

export { UserService, DuplicateEmailsError };
