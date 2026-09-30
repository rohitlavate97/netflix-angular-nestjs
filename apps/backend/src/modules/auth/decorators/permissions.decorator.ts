import { SetMetadata, CustomDecorator } from '@nestjs/common';
import { UserPermission } from '@netflix/shared-types';

export const PERMISSIONS_KEY = 'permissions';

/**
 * Decorator to assign required granular permissions to routes or controllers.
 * Example: @RequirePermissions(UserPermission.CONTENT_CREATE, UserPermission.MEDIA_UPLOAD)
 */
export const RequirePermissions = (...permissions: UserPermission[]): CustomDecorator<string> =>
  SetMetadata(PERMISSIONS_KEY, permissions);
