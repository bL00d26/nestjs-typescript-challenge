import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { Repository } from 'typeorm';
import { User } from '../models/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { NotFoundException } from '@nestjs/common';
import { CreateUserDto } from '../../auth/controllers/dto/create-user.dto';
import { AssignUserDto } from '../controllers/dto/assign-role.dto';
import { UserErrorMessage, UserRole } from '../../constants/users.constants';

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    password: 'hashedPassword',
    role: UserRole.ADMIN,
  } as User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  describe('findOneByEmail', () => {
    it('should return a user if found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockUser);
      const result = await service.findOneByEmail('test@example.com');
      expect(result).toEqual(mockUser);
    });

    it('should return undefined if user is not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(undefined);
      const result = await service.findOneByEmail('nonexistent@example.com');
      expect(result).toBeUndefined();
    });
  });

  describe('create', () => {
    it('should create and return a new user', async () => {
      const createUserDto: CreateUserDto = {
        email: 'newuser@example.com',
        firstName: 'test',
        lastName: 'test',
        password: 'password123',
        role: UserRole.AGENT,
      };

      const hashedPassword = 'hashedPassword123';
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      jest.spyOn(repository, 'create').mockReturnValue({
        ...createUserDto,
        password: hashedPassword,
      } as User);
      jest.spyOn(repository, 'save').mockResolvedValue({
        ...createUserDto,
        deletedAt: null,
        id: 1,
        createAt: new Date('2024-08-27T10:11:04.408Z'),
        updateAt: new Date('2024-08-27T10:11:04.408Z'),
        password: hashedPassword,
      });

      const result = await service.create(createUserDto);

      expect(result).toEqual({
        ...createUserDto,
        id: 1,
        deletedAt: null,
        createAt: new Date('2024-08-27T10:11:04.408Z'),
        updateAt: new Date('2024-08-27T10:11:04.408Z'),
      });
    });
  });

  describe('encryptPassword', () => {
    it('should return a hashed password', async () => {
      const password = 'password123';
      const hashedPassword = 'hashedPassword123';

      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      const result = await service.encryptPassword(password);

      expect(result).toEqual(hashedPassword);
      expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
    });
  });

  describe('comparePassword', () => {
    it('should return true if passwords match', async () => {
      const password = 'password123';
      const hash = 'hashedPassword123';

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.comparePassword(password, hash);

      expect(result).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hash);
    });

    it('should return false if passwords do not match', async () => {
      const password = 'password123';
      const hash = 'hashedPassword123';

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.comparePassword(password, hash);

      expect(result).toBe(false);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hash);
    });
  });

  describe('assignRole', () => {
    it('should update the user role and return the updated user without password', async () => {
      const assignUserDto: AssignUserDto = {
        role: UserRole.ADMIN,
      };

      jest.spyOn(repository, 'findOneBy').mockResolvedValue(mockUser);
      jest.spyOn(repository, 'save').mockResolvedValue({
        ...mockUser,
        role: assignUserDto.role,
      });

      const result = await service.assignRole(1, assignUserDto);

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        role: UserRole.ADMIN,
      });
    });

    it('should throw NotFoundException if user is not found', async () => {
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(undefined);

      const assignUserDto: AssignUserDto = {
        role: UserRole.ADMIN,
      };

      await expect(service.assignRole(999, assignUserDto)).rejects.toThrow(
        new NotFoundException(UserErrorMessage.USER_DOES_NOT_EXIST),
      );
    });
  });
});
