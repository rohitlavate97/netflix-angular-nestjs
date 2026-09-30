import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserPermission, UserRole, ROLE_PERMISSIONS } from '@netflix/shared-types';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<UserPermission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }

    const userRole = user.role as UserRole;
    const grantedPermissions: readonly UserPermission[] = ROLE_PERMISSIONS[userRole] || [];

    const hasAllRequiredPermissions = requiredPermissions.every((permission) =>
      grantedPermissions.includes(permission),
    );

    if (!hasAllRequiredPermissions) {
      const missingPermissions = requiredPermissions.filter(
        (permission) => !grantedPermissions.includes(permission),
      );
      throw new ForbiddenException(
        `Forbidden resource: Missing required permissions [${missingPermissions.join(', ')}]`,
      );
    }

    return true;
  }
}
