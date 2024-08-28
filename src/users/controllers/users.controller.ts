import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';

import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsersService } from '../services/users.service';
import { AssignUserDto } from './dto/assign-role.dto';
import { Roles } from '../../decorators/roles.decorator';
import { UserErrorMessage, UserRole } from '../../constants/users.constants';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { AssignAdminRoleGuard } from '../../auth/guards/assign-admin-role.guard';
import { User } from '../models/user.entity';
import { AuthForbiddenErrorSwagger } from '../../constants/auth.constants';

@ApiTags('Users')
@Controller('api/users')
@Roles(UserRole.ADMIN, UserRole.AGENT, UserRole.CUSTOMER)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('assign-role/:id')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, AssignAdminRoleGuard, RolesGuard)
  @ApiBody({ type: AssignUserDto })
  @ApiResponse({
    status: 200,
    description: 'Role assigned',
    type: User,
  })
  @ApiResponse({
    status: 404,
    description: 'User does not exist',
    schema: {
      example: {
        message: UserErrorMessage.USER_DOES_NOT_EXIST,
        error: 'Not Found',
        statusCode: 404,
      },
    },
  })
  @ApiResponse(AuthForbiddenErrorSwagger)
  async assignRole(
    @Param('id') id: string,
    @Body() assignUserDto: AssignUserDto,
  ): Promise<User> {
    return await this.usersService.assignRole(Number(id), assignUserDto);
  }

  @Get()
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiResponse({
    status: 200,
    description: 'All users from the database',
    type: [User],
  })
  @ApiResponse(AuthForbiddenErrorSwagger)
  async getAll(): Promise<User[]> {
    return await this.usersService.getAll();
  }
}
