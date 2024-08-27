import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { UserRole } from '../../../constants/users.constants';

export class AssignUserDto {
  @ApiProperty({
    example: 'agent',
    enum: UserRole,
    enumName: 'UserRole',
  })
  @IsNotEmpty()
  @IsEnum(UserRole, { message: 'Invalid role type' })
  role: UserRole;
}
