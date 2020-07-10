import {
  Controller,
  Body,
  Post,
  Put,
  Param,
  UseFilters,
  Get,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Email } from '../emails/email.entity';
import { DuplicateEmailFilter } from '../util/duplicate-email.filter';
import { User } from './user.entity';
import { UserService } from './user.service';

import { User as UserEntity } from './user.entity';

import * as Inputs from './user.inputs';
import * as Serializers from './user.serializers';

class ExcludingSerializer extends ClassSerializerInterceptor {
  constructor(reflector: any) {
    super(reflector, { strategy: 'excludeAll' });
  }
}

@Controller('users')
export class UsersController {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Email)
    private emailsRepository: Repository<Email>,
    private service: UserService,
  ) {}

  @Get(':id')
  @UseInterceptors(ExcludingSerializer)
  show(): Serializers.User {
    const user = new UserEntity();
    user.id = 1;
    user.name = 'Patrick';
    // user.createdAt = new Date();
    user.emails = [];

    return new Serializers.User(user);
  }

  // @Post()
  // @UseFilters(new DuplicateEmailFilter())
  // async create(@Body() input: Inputs.UserCreate): Promise<Serializers.User> {
  //   // nick -- service should have same interface / never expose repo directly
  //   const created = await this.service.create(input.name, input.emails || []);
  //   return new Serializers.UserShow(created).json();
  // }

  // @Put(':id')
  // async update(
  //   @Param('id') id: string,
  //   @Body() input: Inputs.UserUpdate,
  // ): Promise<Serializers.User> {
  //   const user = await this.usersRepository.findOneOrFail(id);

  //   const merged = this.usersRepository.merge(user, { name: input.name });
  //   await this.usersRepository.save(merged);

  //   return new Serializers.UserShow(merged).json();
  // }
}
