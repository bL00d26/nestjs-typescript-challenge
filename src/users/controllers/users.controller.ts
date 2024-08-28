import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import {
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UsersService } from '../services/users.service';
import { AssignUserDto } from './dto/assign-role.dto';
import { Roles } from '../../decorators/roles.decorator';
import {
  USERS_PAGINATION_ITEMS_PER_PAGE,
  UserErrorMessage,
  UserRole,
} from '../../constants/users.constants';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { AssignAdminRoleGuard } from '../../auth/guards/assign-admin-role.guard';
import { User } from '../models/user.entity';
import { AuthForbiddenErrorSwagger } from '../../constants/auth.constants';
import { Pagination } from 'nestjs-typeorm-paginate';

@ApiTags('Users')
@Controller('api/users')
@Roles(UserRole.ADMIN, UserRole.AGENT, UserRole.CUSTOMER)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('assign-role/:id')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, AssignAdminRoleGuard, RolesGuard)
  @ApiBody({ type: AssignUserDto })
  @ApiOperation({ summary: 'Assign a role to an user by user id' })
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
  @ApiOperation({ summary: 'Get all orders (paginated)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiResponse({
    status: 200,
    description: 'Get an array with all the users',
    type: [User],
  })
  @ApiResponse(AuthForbiddenErrorSwagger)
  async getAll(
    @Req() req: Request,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: 1,
  ): Promise<Pagination<User>> {
    const route = `${req.protocol}://${req.hostname}:${process.env.PORT}${req.path}`;
    return await this.usersService.getAll({
      page,
      limit: USERS_PAGINATION_ITEMS_PER_PAGE,
      route,
    });
  }
}
