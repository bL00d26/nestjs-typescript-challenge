import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { UserRole } from '../../../constants/users.constants';

export class CreateUserDto {
  @ApiPropertyOptional({ example: 'John' })
  @IsOptional()
  @MaxLength(40)
  firstName: string;

  @ApiPropertyOptional({ example: 'Doe' })
  @IsOptional()
  @MaxLength(40)
  lastName: string;

  @ApiProperty({ example: 'email@demo.com' })
  @IsEmail()
  @MaxLength(40)
  email: string;

  @ApiProperty({
    example: 'agent',
    enum: UserRole,
    enumName: 'UserRole',
  })
  @IsOptional()
  @IsEnum(UserRole, { message: 'Invalid role type' })
  role: UserRole;

  @ApiProperty({ example: 'password' })
  @IsNotEmpty()
  @MaxLength(80)
  password: string;
}
