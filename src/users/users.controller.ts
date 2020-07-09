import { Controller, Body, Post, Put, Param, UseFilters } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Email } from '../emails/email.entity';
import { DuplicateEmailFilter } from '../util/duplicate-email.filter';
import { User } from './user.entity';
import { UserService } from './user.service';

import * as Inputs from './user.inputs';
import * as Serializers from './user.serializers';

@Controller('users')
export class UsersController {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Email)
    private emailsRepository: Repository<Email>,
    private service: UserService,
  ) {}

  @Post()
  @UseFilters(new DuplicateEmailFilter())
  async create(@Body() input: Inputs.UserCreate): Promise<Serializers.User> {
    const created = await this.service.create(input.name, input.emails || []);
    return new Serializers.UserShow(created).json();
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() input: Inputs.UserUpdate,
  ): Promise<Serializers.User> {
    const user = await this.usersRepository.findOneOrFail(id);

    const merged = this.usersRepository.merge(user, { name: input.name });
    await this.usersRepository.save(merged);

    return new Serializers.UserShow(merged).json();
  }
}
