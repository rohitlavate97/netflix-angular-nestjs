import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '@netflix/shared-types';

export const CurrentUser = createParamDecorator(
  (data: keyof JwtPayload | undefined, ctx: ExecutionContext): unknown => {
    const request = ctx.switchToHttp().getRequest<{ user?: JwtPayload }>();
    const user = request.user;
    if (!user) return null;
    return data ? user[data] : user;
  },
);
