import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Profile } from '../../database/entities/profile.entity';
import {
  UserProfileDto,
  CreateProfileDto,
  UpdateProfileDto,
  SelectProfileResponse,
  MAX_PROFILES_PER_USER,
  DEFAULT_PROFILE_AVATARS,
  MaturityRating,
} from '@netflix/shared-types';

@Injectable()
export class ProfilesService {
  private readonly logger = new Logger(ProfilesService.name);

  constructor(
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
  ) {}

  async getProfilesByUserId(userId: string): Promise<UserProfileDto[]> {
    const profiles = await this.profileRepository.find({
      where: { userId },
      order: { createdAt: 'ASC' },
    });
    return profiles.map((p) => this.toDto(p));
  }

  async getProfileById(
    userId: string,
    profileId: string,
    isAdmin = false,
  ): Promise<UserProfileDto> {
    const profile = await this.profileRepository.findOne({
      where: { id: profileId },
    });

    if (!profile) {
      throw new NotFoundException(`Profile not found with ID ${profileId}`);
    }

    if (!isAdmin && profile.userId !== userId) {
      throw new ForbiddenException('Access denied: Profile belongs to another account');
    }

    return this.toDto(profile);
  }

  async createProfile(userId: string, dto: CreateProfileDto): Promise<UserProfileDto> {
    const currentCount = await this.profileRepository.count({
      where: { userId },
    });

    if (currentCount >= MAX_PROFILES_PER_USER) {
      throw new BadRequestException(
        `Profile limit reached: Account can have a maximum of ${MAX_PROFILES_PER_USER} profiles`,
      );
    }

    const trimmedName = dto.name.trim();
    const existing = await this.profileRepository.findOne({
      where: { userId, name: trimmedName },
    });

    if (existing) {
      throw new ConflictException(`A profile named "${trimmedName}" already exists on this account`);
    }

    const isKids = Boolean(dto.isKids);
    let maturityRating: MaturityRating = dto.maturityRating || (isKids ? '7+' : '18+');
    if (isKids && !['ALL', '7+'].includes(maturityRating)) {
      maturityRating = '7+';
    }

    const avatarUrl =
      dto.avatarUrl ||
      (isKids ? DEFAULT_PROFILE_AVATARS[4] : DEFAULT_PROFILE_AVATARS[0]);

    let hashedPin: string | undefined;
    if (dto.pin) {
      hashedPin = await bcrypt.hash(dto.pin, 10);
    }

    const newProfile = this.profileRepository.create({
      userId,
      name: trimmedName,
      avatarUrl,
      isKids,
      maturityRating,
      language: dto.language || 'en',
      pin: hashedPin,
      autoplayNext: dto.autoplayNext ?? true,
    });

    const saved = await this.profileRepository.save(newProfile);
    this.logger.log(`Created profile "${saved.name}" (${saved.id}) for user ${userId}`);
    return this.toDto(saved);
  }

  async updateProfile(
    userId: string,
    profileId: string,
    dto: UpdateProfileDto,
    isAdmin = false,
  ): Promise<UserProfileDto> {
    const profile = await this.profileRepository.findOne({
      where: { id: profileId },
    });

    if (!profile) {
      throw new NotFoundException(`Profile not found with ID ${profileId}`);
    }

    if (!isAdmin && profile.userId !== userId) {
      throw new ForbiddenException('Access denied: Profile belongs to another account');
    }

    if (dto.name) {
      const trimmedName = dto.name.trim();
      if (trimmedName.toLowerCase() !== profile.name.toLowerCase()) {
        const conflict = await this.profileRepository.findOne({
          where: { userId, name: trimmedName },
        });
        if (conflict && conflict.id !== profileId) {
          throw new ConflictException(`A profile named "${trimmedName}" already exists on this account`);
        }
      }
      profile.name = trimmedName;
    }

    if (dto.isKids !== undefined) {
      profile.isKids = dto.isKids;
      if (profile.isKids && !['ALL', '7+'].includes(profile.maturityRating)) {
        profile.maturityRating = '7+';
      }
    }

    if (dto.maturityRating) {
      if (profile.isKids && !['ALL', '7+'].includes(dto.maturityRating)) {
        profile.maturityRating = '7+';
      } else {
        profile.maturityRating = dto.maturityRating;
      }
    }

    if (dto.avatarUrl !== undefined) {
      profile.avatarUrl = dto.avatarUrl;
    }

    if (dto.language !== undefined) {
      profile.language = dto.language;
    }

    if (dto.autoplayNext !== undefined) {
      profile.autoplayNext = dto.autoplayNext;
    }

    if (dto.pin !== undefined) {
      if (dto.pin === null || dto.pin === '') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        profile.pin = null as any;
      } else {
        profile.pin = await bcrypt.hash(dto.pin, 10);
      }
    }

    const updated = await this.profileRepository.save(profile);
    this.logger.log(`Updated profile "${updated.name}" (${updated.id})`);
    return this.toDto(updated);
  }

  async deleteProfile(
    userId: string,
    profileId: string,
    isAdmin = false,
  ): Promise<void> {
    const profile = await this.profileRepository.findOne({
      where: { id: profileId },
    });

    if (!profile) {
      throw new NotFoundException(`Profile not found with ID ${profileId}`);
    }

    if (!isAdmin && profile.userId !== userId) {
      throw new ForbiddenException('Access denied: Profile belongs to another account');
    }

    const count = await this.profileRepository.count({
      where: { userId: profile.userId },
    });

    if (count <= 1) {
      throw new BadRequestException('Cannot delete the last remaining profile on the account');
    }

    await this.profileRepository.remove(profile);
    this.logger.log(`Deleted profile "${profile.name}" (${profile.id})`);
  }

  async verifyPin(
    userId: string,
    profileId: string,
    pin: string,
    isAdmin = false,
  ): Promise<boolean> {
    const profile = await this.profileRepository.findOne({
      where: { id: profileId },
    });

    if (!profile) {
      throw new NotFoundException(`Profile not found with ID ${profileId}`);
    }

    if (!isAdmin && profile.userId !== userId) {
      throw new ForbiddenException('Access denied: Profile belongs to another account');
    }

    if (!profile.pin) {
      return true;
    }

    const matches = await bcrypt.compare(pin, profile.pin);
    if (!matches) {
      throw new UnauthorizedException('Invalid profile PIN');
    }

    return true;
  }

  async selectProfile(
    userId: string,
    profileId: string,
    pin?: string,
    isAdmin = false,
  ): Promise<SelectProfileResponse> {
    const profile = await this.profileRepository.findOne({
      where: { id: profileId },
    });

    if (!profile) {
      throw new NotFoundException(`Profile not found with ID ${profileId}`);
    }

    if (!isAdmin && profile.userId !== userId) {
      throw new ForbiddenException('Access denied: Profile belongs to another account');
    }

    if (profile.pin) {
      if (!pin) {
        throw new UnauthorizedException('Profile is protected by a PIN');
      }
      const matches = await bcrypt.compare(pin, profile.pin);
      if (!matches) {
        throw new UnauthorizedException('Invalid profile PIN');
      }
    }

    return {
      profile: this.toDto(profile),
      selectedAt: new Date().toISOString(),
    };
  }

  getAvailableAvatars(): readonly string[] {
    return DEFAULT_PROFILE_AVATARS;
  }

  private toDto(profile: Profile): UserProfileDto {
    return {
      id: profile.id,
      userId: profile.userId,
      name: profile.name,
      avatarUrl: profile.avatarUrl,
      isKids: profile.isKids,
      maturityRating: profile.maturityRating,
      language: profile.language,
      hasPin: Boolean(profile.pin),
      autoplayNext: profile.autoplayNext,
      createdAt: profile.createdAt ? profile.createdAt.toISOString() : new Date().toISOString(),
      updatedAt: profile.updatedAt ? profile.updatedAt.toISOString() : new Date().toISOString(),
    };
  }
}
