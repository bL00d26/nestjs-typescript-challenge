import { JwtStrategy } from './jwt.strategy';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import * as dotenv from 'dotenv';

dotenv.config();

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [JwtStrategy],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should validate and return the user payload', async () => {
      const payload = {
        userId: 1,
        email: 'user@example.com',
        role: 'admin',
      };

      const result = await strategy.validate(payload);

      expect(result).toEqual({
        id: payload.userId,
        email: payload.email,
        role: payload.role,
      });
    });

    it('should throw an error if JWT secret is not set', async () => {
      process.env.JWT_SECRET = '';

      expect(() => {
        new JwtStrategy();
      }).toThrow(Error);
    });
  });
});
