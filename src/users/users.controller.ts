import { Controller, Body, Post } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { IsNotEmpty } from 'class-validator';

class UserCreateDTO {
  @IsNotEmpty()
  name!: string;
}

class UserShowDTO {
  id!: number;
  name!: string;
  createdAt!: Date;
  updatedAt!: Date;
}

@Controller('users')
export class UsersController {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}

  @Post()
  async create(@Body() input: UserCreateDTO): Promise<UserShowDTO> {
    const user: Partial<User> = {
      name: input.name,
    };

    // tried `create` but need await-able version?
    await this.usersRepository.save(user);

    const { id, name, createdAt, updatedAt } = user;
    return { id, name, createdAt, updatedAt };
  }
}
