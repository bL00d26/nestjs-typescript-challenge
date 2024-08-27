import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { UserRole } from '../../constants/users.constants';
import { AuthErrorMessage } from '../../constants/auth.constants';

@Injectable()
export class RegistrationGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const { body } = context.switchToHttp().getRequest();
    if (body.role === UserRole.ADMIN) {
      throw new UnauthorizedException(
        AuthErrorMessage.ADMIN_ROLE_ASSIGN_REQUIRED,
      );
    }
    return true;
  }
}
