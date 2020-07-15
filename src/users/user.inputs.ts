import { IsNotEmpty, IsArray, IsEmail, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class User {
  @ApiProperty({ example: 'John' })
  name?: string;

  @IsArray()
  @IsEmail({}, { each: true })
  @IsOptional()
  @ApiProperty({
    isArray: true,
    example: ['user@host.example', 'another@host.example'],
  })
  emails?: string[];
}

class Create extends User {
  @IsNotEmpty()
  name!: string;
}

class Update extends User {
  @IsNotEmpty()
  @IsOptional()
  name?: string;
}

export { Create, Update };
