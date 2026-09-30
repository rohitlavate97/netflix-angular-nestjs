import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { UserRole } from '@netflix/shared-types';

describe('RolesGuard', () => {
  let guard: RolesGuard;
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
    guard = new RolesGuard(reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow access if no roles are required on handler or class', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    const context = createMockContext({ role: UserRole.USER });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow access if required roles array is empty', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([]);
    const context = createMockContext({ role: UserRole.USER });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should throw UnauthorizedException if user context is missing from request', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.ADMIN]);
    const context = createMockContext(null);

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('should allow access if user has one of the required roles', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([UserRole.ADMIN, UserRole.CONTENT_MANAGER]);
    const context = createMockContext({ role: UserRole.ADMIN });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow access for CONTENT_MANAGER when included in required roles', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([UserRole.ADMIN, UserRole.CONTENT_MANAGER]);
    const context = createMockContext({ role: UserRole.CONTENT_MANAGER });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should throw ForbiddenException if user lacks the required role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.ADMIN]);
    const context = createMockContext({ role: UserRole.USER });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
