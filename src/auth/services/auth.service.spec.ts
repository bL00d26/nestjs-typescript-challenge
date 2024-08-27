import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from './../../users/services/users.service';
import { JwtService } from '@nestjs/jwt';
import { User } from './../../users/models/user.entity';
import { CreateUserDto } from '../controllers/dto/create-user.dto';
import { UserRole } from '../../constants/users.constants';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: Partial<UsersService>;
  let jwtService: Partial<JwtService>;

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    password: 'hashedPassword',
    role: UserRole.ADMIN,
  } as User;

  beforeEach(async () => {
    usersService = {
      findOneByEmail: jest.fn().mockResolvedValue(mockUser),
      comparePassword: jest.fn().mockResolvedValue(true),
      create: jest.fn().mockResolvedValue(mockUser),
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('mockJwtToken'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('validateUserLocal', () => {
    it('should return user data without password if validation is successful', async () => {
      const result = await service.validateUserLocal(
        'test@example.com',
        'password',
      );
      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      });
    });

    it('should return null if user is not found', async () => {
      (usersService.findOneByEmail as jest.Mock).mockResolvedValueOnce(null);
      const result = await service.validateUserLocal(
        'test@example.com',
        'password',
      );
      expect(result).toBeNull();
    });

    it('should return null if password does not match', async () => {
      (usersService.comparePassword as jest.Mock).mockResolvedValueOnce(false);
      const result = await service.validateUserLocal(
        'test@example.com',
        'wrongPassword',
      );
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return an access token', async () => {
      const result = await service.login(mockUser);
      expect(result).toEqual({
        access_token: 'mockJwtToken',
      });
      expect(jwtService.sign).toHaveBeenCalledWith({
        userId: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      });
    });
  });

  describe('userExists', () => {
    it('should return user if it exists', async () => {
      const result = await service.userExists('test@example.com');
      expect(result).toEqual(mockUser);
    });

    it('should return null if user does not exist', async () => {
      (usersService.findOneByEmail as jest.Mock).mockResolvedValueOnce(null);
      const result = await service.userExists('nonexistent@example.com');
      expect(result).toBeNull();
    });
  });

  describe('createUser', () => {
    it('should create a new user and return an access token', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@test.com',
        firstName: 'test',
        lastName: 'test',
        password: 'test',
        role: UserRole.AGENT,
      };
      const result = await service.createUser(createUserDto);
      expect(result).toEqual({
        access_token: 'mockJwtToken',
      });
      expect(usersService.create).toHaveBeenCalledWith(createUserDto);
      expect(jwtService.sign).toHaveBeenCalledWith({
        userId: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      });
    });
  });
});
