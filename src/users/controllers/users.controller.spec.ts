/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from '../services/users.service';
import { AssignUserDto } from './dto/assign-role.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { AssignAdminRoleGuard } from '../../auth/guards/assign-admin-role.guard';
import { User } from '../models/user.entity';
import { UserErrorMessage, UserRole } from '../../constants/users.constants';
import { NotFoundException } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: Partial<UsersService>;

  const mockUser: User = {
    id: 2,
    email: 'martin.perez@sundevs.com',
    firstName: 'Martin',
    lastName: 'Perez',
    password: 'hashedPassword',
    role: UserRole.ADMIN,
    createAt: new Date('2024-08-27T10:11:04.408Z'),
    updateAt: new Date('2024-08-27T10:11:04.408Z'),
    deletedAt: null,
  } as User;

  beforeEach(async () => {
    usersService = {
      assignRole: jest.fn().mockResolvedValue(mockUser),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: usersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  describe('assignRole', () => {
    it('should assign a role to the user and return the updated user', async () => {
      const assignUserDto: AssignUserDto = { role: UserRole.AGENT };
      const result = await controller.assignRole('2', assignUserDto);

      expect(result).toEqual(mockUser);
      expect(usersService.assignRole).toHaveBeenCalledWith(2, assignUserDto);
    });

    it('should throw NotFoundException if the user is not found', async () => {
      jest
        .spyOn(usersService, 'assignRole')
        .mockRejectedValueOnce(
          new NotFoundException(UserErrorMessage.USER_DOES_NOT_EXIST),
        );

      const assignUserDto: AssignUserDto = { role: UserRole.AGENT };

      await expect(controller.assignRole('999', assignUserDto)).rejects.toThrow(
        new NotFoundException(UserErrorMessage.USER_DOES_NOT_EXIST),
      );
      expect(usersService.assignRole).toHaveBeenCalledWith(999, assignUserDto);
    });
  });
});
