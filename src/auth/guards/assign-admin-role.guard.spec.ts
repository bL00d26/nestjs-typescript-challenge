import { AssignAdminRoleGuard } from './assign-admin-role.guard';
import { ExecutionContext } from '@nestjs/common';
import { UserRole } from '../../constants/users.constants';

describe('AssignAdminRoleGuard', () => {
  let guard: AssignAdminRoleGuard;
  let mockExecutionContext: Partial<ExecutionContext>;

  beforeEach(() => {
    guard = new AssignAdminRoleGuard();

    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          user: {},
          body: {},
        }),
      }),
    };
  });

  it('should allow access if the assigned role is not ADMIN', () => {
    const mockRequest = {
      user: { role: UserRole.AGENT },
      body: { role: UserRole.AGENT },
    };

    jest
      .spyOn(mockExecutionContext.switchToHttp(), 'getRequest')
      .mockReturnValue(mockRequest);

    expect(guard.canActivate(mockExecutionContext as ExecutionContext)).toBe(
      true,
    );
  });

  it('should allow access if the user role is ADMIN and the assigned role is ADMIN', () => {
    const mockRequest = {
      user: { role: UserRole.ADMIN },
      body: { role: UserRole.ADMIN },
    };

    jest
      .spyOn(mockExecutionContext.switchToHttp(), 'getRequest')
      .mockReturnValue(mockRequest);

    expect(guard.canActivate(mockExecutionContext as ExecutionContext)).toBe(
      true,
    );
  });

  it('should deny access if the user is not ADMIN and tries to assign the ADMIN role', () => {
    const mockRequest = {
      user: { role: UserRole.AGENT },
      body: { role: UserRole.ADMIN },
    };

    jest
      .spyOn(mockExecutionContext.switchToHttp(), 'getRequest')
      .mockReturnValue(mockRequest);

    expect(guard.canActivate(mockExecutionContext as ExecutionContext)).toBe(
      false,
    );
  });
});
