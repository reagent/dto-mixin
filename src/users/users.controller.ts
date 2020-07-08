import { Controller, Body, Post, Put, Param } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { User } from './user.entity';
import * as Inputs from './user.inputs';
import * as Serializers from './user.serializers';

@Controller('users')
export class UsersController {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  @Post()
  create(@Body() input: Inputs.UserCreate): Promise<Serializers.UserShow> {
    const user = this.usersRepository.create({ name: input.name });
    return this.usersRepository.save(user);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() input: Inputs.UserUpdate,
  ): Promise<Serializers.UserShow> {
    const user = await this.usersRepository.findOneOrFail(id);
    const merged = this.usersRepository.merge(user, input);

    return this.usersRepository.save(merged);
  }
}
