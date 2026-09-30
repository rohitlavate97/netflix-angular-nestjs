import { SetMetadata, CustomDecorator } from '@nestjs/common';
import { UserRole } from '@netflix/shared-types';

export const ROLES_KEY = 'roles';

/**
 * Decorator to assign required user roles to routes or controllers.
 * Example: @Roles(UserRole.ADMIN, UserRole.CONTENT_MANAGER)
 */
export const Roles = (...roles: UserRole[]): CustomDecorator<string> =>
  SetMetadata(ROLES_KEY, roles);
