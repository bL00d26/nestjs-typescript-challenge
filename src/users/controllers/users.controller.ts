import {
  Body,
  Controller,
  HttpCode,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';

import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsersService } from '../services/users.service';
import { AssignUserDto } from './dto/assign-role.dto';
import { Roles } from '../../decorators/roles.decorator';
import { UserRole } from '../../constants/users.constants';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { CustomAdminGuard } from '../../auth/guards/custom-admin.guard';
import { User } from '../models/user.entity';

@ApiTags('Users')
@Controller('api/users')
@UseGuards(JwtAuthGuard, CustomAdminGuard, RolesGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('assign-role/:id')
  @HttpCode(200)
  @Roles(UserRole.ADMIN, UserRole.AGENT, UserRole.CUSTOMER)
  @ApiBody({
    schema: {
      example: {
        role: 'agent',
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Role assigned',
    schema: {
      example: {
        id: '2',
        firstName: 'Martin',
        lastName: 'Perez',
        email: 'martin.perez@sundevs.com',
        role: 'admin',
        createAt: '2024-08-27T06:14:15.051Z',
        updateAt: '2024-08-27T09:44:23.399Z',
        deletedAt: null,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'User does not exist',
    schema: {
      example: {
        message: 'USER_DOES_NOT_EXIST',
        error: 'Not Found',
        statusCode: 404,
      },
    },
  })
  async assignRole(
    @Param('id') id: string,
    @Body() assignUserDto: AssignUserDto,
  ): Promise<User> {
    return await this.usersService.assignRole(Number(id), assignUserDto);
  }
}
