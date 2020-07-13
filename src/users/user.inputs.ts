import { IsNotEmpty, IsArray, IsEmail, IsOptional } from 'class-validator';

class User {
  @IsNotEmpty() // maybe not use
  name!: string;

  @IsArray()
  @IsEmail({}, { each: true })
  @IsOptional()
  emails: string[] = [];
}

class UserCreate extends User {}
class UserUpdate extends User {}

export { UserCreate, UserUpdate };
