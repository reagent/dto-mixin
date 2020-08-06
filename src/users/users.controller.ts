import {
  Controller,
  Body,
  Post,
  Put,
  Param,
  UseFilters,
  Get,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { DuplicateEmailFilter } from '../util/duplicate-email.filter';
import { UserService } from './user.service';

import * as Inputs from './user.inputs';
import * as Serializers from './user.serializers';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('users')
export class UsersController {
  constructor(private service: UserService) {}

  @Get(':id')
  @ApiOperation({
    summary: 'Fetch a single user and associated email addresses',
  })
  @ApiResponse({
    type: Serializers.User,
    status: HttpStatus.OK,
    description: 'OK',
  })
  async show(@Param('id', ParseIntPipe) id: number): Promise<Serializers.User> {
    const user = await this.service.show(id);
    return new Serializers.User(user);
  }

  @Post()
  @UseFilters(new DuplicateEmailFilter())
  @ApiOperation({
    summary: 'Create a new user with optional associated email addresses',
  })
  @ApiResponse({ type: Serializers.User, status: HttpStatus.CREATED })
  @ApiResponse({ status: HttpStatus.UNPROCESSABLE_ENTITY })
  async create(@Body() input: Inputs.Create): Promise<Serializers.User> {
    const user = await this.service.create(input);
    return new Serializers.User(user);
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
    const user = await this.service.update(id, input);
    return new Serializers.User(user);
  }
}
