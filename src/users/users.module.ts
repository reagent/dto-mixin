import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Email } from '../emails/email.entity';
import { UsersController } from './users.controller';
import { UserService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Email])],
  controllers: [UsersController],
  providers: [UserService],
})
export class UsersModule {}
