import {
  Controller,
  Body,
  Post,
  Put,
  Param,
  UseFilters,
  Get,
  UseInterceptors,
  HttpStatus,
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
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

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
  show(@Param('id') id: string): Promise<Serializers.User> {
    return this.service.show(id);
  }

  @Post()
  @UseFilters(new DuplicateEmailFilter())
  @ApiOperation({
    summary: 'Create a new user with optional associated email addresses',
  })
  @ApiResponse({ status: HttpStatus.CREATED })
  @ApiResponse({ status: HttpStatus.UNPROCESSABLE_ENTITY })
  create(@Body() input: Inputs.Create): Promise<Serializers.User> {
    return this.service.create(input);
  }

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
