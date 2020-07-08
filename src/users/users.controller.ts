import { Controller, Body, Post, Put, Param } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User as UserEntity } from './user.entity';
import { Repository } from 'typeorm';
import { IsNotEmpty } from 'class-validator';

namespace Inputs {
  class User {
    @IsNotEmpty()
    name!: string;
  }

  export class UserCreate extends User {}
  export class UserUpdate extends User {}
}

namespace Serializers {
  type User = Pick<UserEntity, 'id' | 'name' | 'createdAt' | 'updatedAt'>;

  export type UserShow = User;
}

@Controller('users')
export class UsersController {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
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
    let user = await this.usersRepository.findOneOrFail(id);
    user.name = input.name;
    return this.usersRepository.save(user);
  }
}
