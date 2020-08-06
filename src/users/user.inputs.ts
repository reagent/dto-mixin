import { IsNotEmpty, IsArray, IsEmail, IsOptional } from 'class-validator';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';

class User {
  @ApiProperty({ example: 'John' })
  name?: string;

  @IsArray()
  @IsEmail({}, { each: true })
  @IsOptional()
  @ApiPropertyOptional({
    // isArray: true,
    type: 'string',
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
  @ApiPropertyOptional()
  name?: string;
}

export { Create, Update };
