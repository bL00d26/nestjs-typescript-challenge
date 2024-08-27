import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from '../services/auth.service';
import { RegistrationGuard } from '../guards/registration.guard';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { HttpStatus, HttpException } from '@nestjs/common';
import { UserErrorMessage, UserRole } from '../../constants/users.constants';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: Partial<AuthService>;

  const mockUser = {
    id: 9,
    firstName: 'test',
    lastName: 'test',
    createAt: new Date('2024-08-27T10:11:04.408Z'),
    updateAt: new Date('2024-08-27T10:11:04.408Z'),
    deletedAt: null,
    role: UserRole.CUSTOMER,
    email: 'email@demo.com',
    password: 'hashedPassword',
  };

  const mockToken = {
    access_token:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI5IiwiZW1haWwiOiJlbWFpbEBkZW1vLmNvbSIsImlhdCI6MTY1MjA0NzQzNSwiZXhwIjoxNjUyMTMzODM1fQ.ikFigJQn1ttuPAV06Yjr4PL6lKvm_HMygcTU8N1P__0',
  };

  beforeEach(async () => {
    authService = {
      userExists: jest.fn(),
      createUser: jest.fn(),
      login: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authService,
        },
      ],
    })
      .overrideGuard(RegistrationGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(LocalAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe('register', () => {
    it('should register a new user and return access_token', async () => {
      const createUserDto: CreateUserDto = {
        email: 'email@demo.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'password123',
        role: UserRole.CUSTOMER,
      };

      jest.spyOn(authService, 'userExists').mockResolvedValue(null);
      jest.spyOn(authService, 'createUser').mockResolvedValue(mockToken);

      const result = await controller.register(createUserDto);

      expect(result).toEqual(mockToken);
      expect(authService.userExists).toHaveBeenCalledWith(createUserDto.email);
      expect(authService.createUser).toHaveBeenCalledWith(createUserDto);
    });

    it('should throw ConflictException if the user already exists', async () => {
      const createUserDto: CreateUserDto = {
        email: 'email@demo.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'password123',
        role: UserRole.CUSTOMER,
      };

      jest.spyOn(authService, 'userExists').mockResolvedValue(mockUser);

      await expect(controller.register(createUserDto)).rejects.toThrow(
        new HttpException(
          UserErrorMessage.USER_ALREADY_REGISTERED,
          HttpStatus.CONFLICT,
        ),
      );
      expect(authService.userExists).toHaveBeenCalledWith(createUserDto.email);
      expect(authService.createUser).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should return an access token when credentials are valid', async () => {
      const req = { user: mockUser };

      jest.spyOn(authService, 'login').mockResolvedValue(mockToken);

      const result = await controller.login(req);

      expect(result).toEqual(mockToken);
      expect(authService.login).toHaveBeenCalledWith(req.user);
    });

    it('should return UnauthorizedException if credentials are invalid', async () => {
      const req = { user: null };

      jest.spyOn(authService, 'login').mockResolvedValue(null);

      const result = await controller.login(req);

      expect(result).toBeNull();
      expect(authService.login).toHaveBeenCalledWith(req.user);
    });
  });
});
