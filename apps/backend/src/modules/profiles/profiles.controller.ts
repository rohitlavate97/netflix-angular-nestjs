import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { ProfilesService } from './profiles.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { VerifyPinDto } from './dto/verify-pin.dto';
import { SelectProfileDto } from './dto/select-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  ApiResponse,
  UserProfileDto,
  SelectProfileResponse,
  JwtPayload,
  UserRole,
} from '@netflix/shared-types';

@ApiTags('Profiles')
@Controller('profiles')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all profiles belonging to the authenticated account' })
  @SwaggerResponse({ status: 200, description: 'List of account profiles' })
  async getProfiles(
    @CurrentUser() user: JwtPayload,
  ): Promise<ApiResponse<UserProfileDto[]>> {
    const data = await this.profilesService.getProfilesByUserId(user.sub);
    return {
      success: true,
      data,
      message: 'Account profiles retrieved successfully',
    };
  }

  @Get('avatars')
  @ApiOperation({ summary: 'Get list of available profile avatar presets' })
  @SwaggerResponse({ status: 200, description: 'List of avatar URLs' })
  getAvatars(): ApiResponse<readonly string[]> {
    const data = this.profilesService.getAvailableAvatars();
    return {
      success: true,
      data,
      message: 'Avatar presets retrieved successfully',
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single profile details by ID' })
  @ApiParam({ name: 'id', description: 'Profile UUID' })
  @SwaggerResponse({ status: 200, description: 'Profile details returned' })
  @SwaggerResponse({ status: 404, description: 'Profile not found' })
  @SwaggerResponse({ status: 403, description: 'Forbidden access to profile' })
  async getProfile(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<ApiResponse<UserProfileDto>> {
    const isAdmin = user.role === UserRole.ADMIN;
    const data = await this.profilesService.getProfileById(user.sub, id, isAdmin);
    return {
      success: true,
      data,
      message: 'Profile retrieved successfully',
    };
  }

  @Post()
  @ApiOperation({ summary: 'Create a new profile (max 5 per account)' })
  @SwaggerResponse({ status: 201, description: 'Profile created successfully' })
  @SwaggerResponse({ status: 400, description: 'Profile limit reached' })
  @SwaggerResponse({ status: 409, description: 'Profile name already exists' })
  async createProfile(
    @Body() dto: CreateProfileDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<ApiResponse<UserProfileDto>> {
    const data = await this.profilesService.createProfile(user.sub, dto);
    return {
      success: true,
      data,
      message: 'Profile created successfully',
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update profile details, preferences, or PIN' })
  @ApiParam({ name: 'id', description: 'Profile UUID' })
  @SwaggerResponse({ status: 200, description: 'Profile updated successfully' })
  @SwaggerResponse({ status: 404, description: 'Profile not found' })
  @SwaggerResponse({ status: 403, description: 'Forbidden access to profile' })
  async updateProfile(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProfileDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<ApiResponse<UserProfileDto>> {
    const isAdmin = user.role === UserRole.ADMIN;
    const data = await this.profilesService.updateProfile(user.sub, id, dto, isAdmin);
    return {
      success: true,
      data,
      message: 'Profile updated successfully',
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a profile (cannot delete last remaining profile)' })
  @ApiParam({ name: 'id', description: 'Profile UUID' })
  @SwaggerResponse({ status: 200, description: 'Profile deleted successfully' })
  @SwaggerResponse({ status: 400, description: 'Cannot delete the only profile' })
  @SwaggerResponse({ status: 404, description: 'Profile not found' })
  async deleteProfile(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<ApiResponse<{ deleted: boolean }>> {
    const isAdmin = user.role === UserRole.ADMIN;
    await this.profilesService.deleteProfile(user.sub, id, isAdmin);
    return {
      success: true,
      data: { deleted: true },
      message: 'Profile deleted successfully',
    };
  }

  @Post(':id/verify-pin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify 4-digit PIN for a locked profile' })
  @ApiParam({ name: 'id', description: 'Profile UUID' })
  @SwaggerResponse({ status: 200, description: 'PIN verification result' })
  @SwaggerResponse({ status: 401, description: 'Invalid PIN' })
  async verifyPin(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: VerifyPinDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<ApiResponse<{ verified: boolean }>> {
    const isAdmin = user.role === UserRole.ADMIN;
    await this.profilesService.verifyPin(user.sub, id, dto.pin, isAdmin);
    return {
      success: true,
      data: { verified: true },
      message: 'Profile PIN verified successfully',
    };
  }

  @Post(':id/select')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Select active profile for streaming session' })
  @ApiParam({ name: 'id', description: 'Profile UUID' })
  @SwaggerResponse({ status: 200, description: 'Profile selected successfully' })
  @SwaggerResponse({ status: 401, description: 'Profile is locked and PIN is required/invalid' })
  async selectProfile(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SelectProfileDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<ApiResponse<SelectProfileResponse>> {
    const isAdmin = user.role === UserRole.ADMIN;
    const data = await this.profilesService.selectProfile(user.sub, id, dto.pin, isAdmin);
    return {
      success: true,
      data,
      message: 'Profile selected successfully',
    };
  }
}
