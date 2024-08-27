import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { UserRole } from '../../constants/users.constants';

@Injectable()
export class AssignAdminRoleGuard implements CanActivate {
  constructor() {}

  canActivate(context: ExecutionContext): boolean {
    const { user, body } = context.switchToHttp().getRequest();
    if (body.role !== UserRole.ADMIN) {
      return true;
    }
    return user.role === UserRole.ADMIN;
  }
}
