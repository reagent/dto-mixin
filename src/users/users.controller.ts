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
  ParseIntPipe,
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
  @ApiOperation({
    summary: 'Fetch a single user and associated email addresses',
  })
  @ApiResponse({
    type: Serializers.User,
    status: HttpStatus.OK,
    description: 'OK',
  })
  show(@Param('id', ParseIntPipe) id: number): Promise<Serializers.User> {
    return this.service.show(id);
  }

  @Post()
  @UseFilters(new DuplicateEmailFilter())
  @ApiOperation({
    summary: 'Create a new user with optional associated email addresses',
  })
  @ApiResponse({ type: Serializers.User, status: HttpStatus.CREATED })
  @ApiResponse({ status: HttpStatus.UNPROCESSABLE_ENTITY })
  create(@Body() input: Inputs.Create): Promise<Serializers.User> {
    return this.service.create(input);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update a user and optionally replace associated email addresses',
  })
  @ApiResponse({
    type: Serializers.User,
    status: HttpStatus.OK,
    description: 'OK',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() input: Inputs.Update,
  ): Promise<Serializers.User> {
    return this.service.update(id, input);
  }
}
