import { RolesGuard } from './roles.guard';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../constants/users.constants';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;
  let mockExecutionContext: Partial<ExecutionContext>;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);

    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          user: { role: UserRole.AGENT },
        }),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    };
  });

  it('should allow access if no roles are required', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

    expect(guard.canActivate(mockExecutionContext as ExecutionContext)).toBe(
      true,
    );
  });

  it('should allow access if the user has one of the required roles', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([UserRole.AGENT, UserRole.ADMIN]);

    expect(guard.canActivate(mockExecutionContext as ExecutionContext)).toBe(
      true,
    );
  });

  it('should deny access if the user does not have any of the required roles', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([UserRole.ADMIN]);

    expect(guard.canActivate(mockExecutionContext as ExecutionContext)).toBe(
      false,
    );
  });

  it('should allow access if user role matches exactly', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([UserRole.AGENT]);

    expect(guard.canActivate(mockExecutionContext as ExecutionContext)).toBe(
      true,
    );
  });
});
