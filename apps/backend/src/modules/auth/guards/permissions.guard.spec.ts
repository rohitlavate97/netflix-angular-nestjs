import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionsGuard } from './permissions.guard';
import { UserPermission, UserRole } from '@netflix/shared-types';

describe('PermissionsGuard', () => {
  let guard: PermissionsGuard;
  let reflector: Reflector;

  const createMockContext = (user?: { role: UserRole } | null): ExecutionContext => {
    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({ user }),
      }),
    } as unknown as ExecutionContext;
  };

  beforeEach(() => {
    reflector = new Reflector();
    guard = new PermissionsGuard(reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow access if no permissions are required', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    const context = createMockContext({ role: UserRole.USER });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow access if required permissions array is empty', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([]);
    const context = createMockContext({ role: UserRole.USER });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should throw UnauthorizedException if user context is missing from request', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([UserPermission.CONTENT_CREATE]);
    const context = createMockContext(null);

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('should allow access if ADMIN role possesses all permissions', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([UserPermission.CONTENT_CREATE, UserPermission.MEDIA_UPLOAD]);
    const context = createMockContext({ role: UserRole.ADMIN });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow access if CONTENT_MANAGER has required content/media permissions', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([UserPermission.CONTENT_CREATE, UserPermission.MEDIA_UPLOAD]);
    const context = createMockContext({ role: UserRole.CONTENT_MANAGER });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should throw ForbiddenException if USER role lacks content permissions', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([UserPermission.CONTENT_CREATE]);
    const context = createMockContext({ role: UserRole.USER });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException if MODERATOR lacks media delete permission', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([UserPermission.MEDIA_DELETE]);
    const context = createMockContext({ role: UserRole.MODERATOR });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
