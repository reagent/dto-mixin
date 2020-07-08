import { IsNotEmpty } from 'class-validator';

class User {
  @IsNotEmpty()
  name!: string;
}

class UserCreate extends User {}
class UserUpdate extends User {}

export { UserCreate, UserUpdate };
