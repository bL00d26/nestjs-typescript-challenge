import { RegistrationGuard } from './registration.guard';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { UserRole } from '../../constants/users.constants';
import { AuthErrorMessage } from '../../constants/auth.constants';

describe('RegistrationGuard', () => {
  let guard: RegistrationGuard;
  let mockExecutionContext: Partial<ExecutionContext>;

  beforeEach(() => {
    guard = new RegistrationGuard();

    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          body: {},
        }),
      }),
    };
  });

  it('should allow access if the role is not ADMIN', () => {
    const mockRequest = {
      body: { role: UserRole.AGENT },
    };

    jest
      .spyOn(mockExecutionContext.switchToHttp(), 'getRequest')
      .mockReturnValue(mockRequest);

    expect(guard.canActivate(mockExecutionContext as ExecutionContext)).toBe(
      true,
    );
  });

  it('should throw UnauthorizedException if the role is ADMIN', () => {
    const mockRequest = {
      body: { role: UserRole.ADMIN },
    };

    jest
      .spyOn(mockExecutionContext.switchToHttp(), 'getRequest')
      .mockReturnValue(mockRequest);

    expect(() =>
      guard.canActivate(mockExecutionContext as ExecutionContext),
    ).toThrow(
      new UnauthorizedException(AuthErrorMessage.ADMIN_ROLE_ASSIGN_REQUIRED),
    );
  });
});
