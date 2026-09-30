import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse as SwaggerResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { Roles } from './decorators/roles.decorator';
import { RequirePermissions } from './decorators/permissions.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import {
  ApiResponse,
  AuthResponse,
  AuthTokens,
  JwtPayload,
  UserRole,
  UserPermission,
} from '@netflix/shared-types';

@ApiTags('Authentication & Authorization')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new user account with default profile' })
  @SwaggerResponse({ status: 201, description: 'User registered successfully' })
  @SwaggerResponse({ status: 409, description: 'Email address already exists' })
  async register(
    @Body() dto: RegisterDto,
    @Req() req: Request,
  ): Promise<ApiResponse<AuthResponse>> {
    const ip = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    const data = await this.authService.register(dto, ip, userAgent);
    return {
      success: true,
      data,
      message: 'User registered successfully',
    };
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate user credentials and issue token pair' })
  @SwaggerResponse({ status: 200, description: 'Login successful' })
  @SwaggerResponse({ status: 401, description: 'Invalid email or password' })
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
  ): Promise<ApiResponse<AuthResponse>> {
    const ip = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    const data = await this.authService.login(dto, ip, userAgent);
    return {
      success: true,
      data,
      message: 'Login successful',
    };
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate and exchange refresh token for a new token pair' })
  @SwaggerResponse({ status: 200, description: 'Tokens rotated successfully' })
  @SwaggerResponse({ status: 401, description: 'Invalid or expired refresh token' })
  async refresh(
    @Body() dto: RefreshTokenDto,
    @Req() req: Request,
  ): Promise<ApiResponse<AuthTokens>> {
    const ip = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    const data = await this.authService.refreshTokens(dto, ip, userAgent);
    return {
      success: true,
      data,
      message: 'Tokens refreshed successfully',
    };
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoke active refresh token' })
  @SwaggerResponse({ status: 200, description: 'Logged out successfully' })
  async logout(@Body() dto: RefreshTokenDto): Promise<ApiResponse<{ revoked: boolean }>> {
    await this.authService.logout(dto.refreshToken);
    return {
      success: true,
      data: { revoked: true },
      message: 'Logged out successfully',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user profile' })
  @SwaggerResponse({ status: 200, description: 'Current user profile returned' })
  @SwaggerResponse({ status: 401, description: 'Unauthorized' })
  async me(@CurrentUser() user: JwtPayload): Promise<ApiResponse<unknown>> {
    const data = await this.authService.getCurrentUser(user.sub);
    return {
      success: true,
      data,
      message: 'Current user retrieved successfully',
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin-check')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify admin role authorization' })
  @SwaggerResponse({ status: 200, description: 'Admin authorization confirmed' })
  @SwaggerResponse({ status: 403, description: 'Forbidden: Insufficient role' })
  adminCheck(@CurrentUser() user: JwtPayload): ApiResponse<{ authorized: boolean; role: UserRole }> {
    return {
      success: true,
      data: { authorized: true, role: user.role },
      message: 'Admin authorization verified',
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CONTENT_MANAGER)
  @Get('manager-check')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify content manager role authorization' })
  @SwaggerResponse({ status: 200, description: 'Manager authorization confirmed' })
  @SwaggerResponse({ status: 403, description: 'Forbidden: Insufficient role' })
  managerCheck(@CurrentUser() user: JwtPayload): ApiResponse<{ authorized: boolean; role: UserRole }> {
    return {
      success: true,
      data: { authorized: true, role: user.role },
      message: 'Manager authorization verified',
    };
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(UserPermission.CONTENT_CREATE, UserPermission.MEDIA_UPLOAD)
  @Get('permission-check')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify granular permissions authorization' })
  @SwaggerResponse({ status: 200, description: 'Permissions authorization confirmed' })
  @SwaggerResponse({ status: 403, description: 'Forbidden: Insufficient permissions' })
  permissionCheck(@CurrentUser() user: JwtPayload): ApiResponse<{ authorized: boolean; role: UserRole }> {
    return {
      success: true,
      data: { authorized: true, role: user.role },
      message: 'Permissions authorization verified',
    };
  }
}
