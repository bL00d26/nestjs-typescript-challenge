import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { UserRole } from '../../constants/users.constants';

@Injectable()
export class RegistrationGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const { body } = context.switchToHttp().getRequest();
    if (body.role === UserRole.ADMIN) {
      throw new UnauthorizedException(
        'Only administrators can assign the admin role.',
      );
    }
    return true;
  }
}
