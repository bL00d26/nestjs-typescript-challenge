import { Test, TestingModule } from '@nestjs/testing';
import { LocalStrategy } from './local.strategy';
import { AuthService } from '../services/auth.service';
import { UnauthorizedException } from '@nestjs/common';
import { UserRole } from '../../constants/users.constants';

describe('LocalStrategy', () => {
  let strategy: LocalStrategy;
  let authService: Partial<AuthService>;

  beforeEach(async () => {
    authService = {
      validateUserLocal: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalStrategy,
        {
          provide: AuthService,
          useValue: authService,
        },
      ],
    }).compile();

    strategy = module.get<LocalStrategy>(LocalStrategy);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should return the user if validation is successful', async () => {
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

      jest.spyOn(authService, 'validateUserLocal').mockResolvedValue(mockUser);

      const result = await strategy.validate('user@example.com', 'password123');

      expect(result).toEqual(mockUser);
      expect(authService.validateUserLocal).toHaveBeenCalledWith(
        'user@example.com',
        'password123',
      );
    });

    it('should throw UnauthorizedException if validation fails', async () => {
      jest.spyOn(authService, 'validateUserLocal').mockResolvedValue(null);

      await expect(
        strategy.validate('user@example.com', 'wrongPassword'),
      ).rejects.toThrow(UnauthorizedException);

      expect(authService.validateUserLocal).toHaveBeenCalledWith(
        'user@example.com',
        'wrongPassword',
      );
    });
  });
});
