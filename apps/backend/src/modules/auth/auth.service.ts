import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { User, Profile, RefreshToken } from '../../database/entities';
import { AuthResponse, AuthTokens, UserRole, JwtPayload } from '@netflix/shared-types';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly ACCESS_TOKEN_EXPIRY = 900; // 15 minutes (in seconds)
  private readonly REFRESH_TOKEN_EXPIRY_DAYS = 7;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    private readonly jwtService: JwtService,
  ) {}

  async register(
    dto: RegisterDto,
    ip?: string,
    userAgent?: string,
  ): Promise<AuthResponse> {
    const existing = await this.userRepository.findOne({
      where: { email: dto.email.toLowerCase() },
    });
    if (existing) {
      throw new ConflictException('Email address is already registered');
    }

    const passwordHash = await this.hashPassword(dto.password);

    const user = this.userRepository.create({
      email: dto.email.toLowerCase(),
      passwordHash,
      role: UserRole.USER,
      isEmailVerified: false,
      isActive: true,
    });
    const savedUser = await this.userRepository.save(user);

    // Create initial primary profile
    const defaultProfileName = dto.profileName || dto.email.split('@')[0];
    const initialProfile = this.profileRepository.create({
      userId: savedUser.id,
      name: defaultProfileName,
      isKids: false,
      maturityRating: '18+',
      language: 'en',
    });
    await this.profileRepository.save(initialProfile);

    const tokens = await this.generateAndStoreTokens(savedUser, ip, userAgent);

    this.logger.log(`New user registered: ${savedUser.email}`);
    return {
      tokens,
      user: {
        id: savedUser.id,
        email: savedUser.email,
        role: savedUser.role,
        isEmailVerified: savedUser.isEmailVerified,
      },
    };
  }

  async login(
    dto: LoginDto,
    ip?: string,
    userAgent?: string,
  ): Promise<AuthResponse> {
    const user = await this.userRepository.findOne({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isMatch = await this.comparePassword(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = await this.generateAndStoreTokens(user, ip, userAgent);

    this.logger.log(`User logged in: ${user.email}`);
    return {
      tokens,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    };
  }

  async refreshTokens(
    dto: RefreshTokenDto,
    ip?: string,
    userAgent?: string,
  ): Promise<AuthTokens> {
    const tokenHash = this.hashToken(dto.refreshToken);

    const tokenRecord = await this.refreshTokenRepository.findOne({
      where: { tokenHash, isRevoked: false },
      relations: ['user'],
    });

    if (!tokenRecord) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    if (new Date() > tokenRecord.expiresAt) {
      tokenRecord.isRevoked = true;
      await this.refreshTokenRepository.save(tokenRecord);
      throw new UnauthorizedException('Refresh token has expired');
    }

    const user = tokenRecord.user;
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User account is inactive or disabled');
    }

    // Token Rotation: Revoke old token and issue a fresh pair
    tokenRecord.isRevoked = true;
    await this.refreshTokenRepository.save(tokenRecord);

    const newTokens = await this.generateAndStoreTokens(user, ip, userAgent);
    return newTokens;
  }

  async logout(refreshToken: string): Promise<void> {
    if (!refreshToken) return;
    const tokenHash = this.hashToken(refreshToken);
    const tokenRecord = await this.refreshTokenRepository.findOne({
      where: { tokenHash },
    });
    if (tokenRecord) {
      tokenRecord.isRevoked = true;
      await this.refreshTokenRepository.save(tokenRecord);
    }
  }

  async getCurrentUser(userId: string): Promise<Omit<User, 'passwordHash'>> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['profiles', 'subscriptions'],
    });

    if (!user) {
      throw new NotFoundException('User profile not found');
    }

    delete (user as { passwordHash?: string }).passwordHash;
    return user as Omit<User, 'passwordHash'>;
  }

  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private async generateAndStoreTokens(
    user: User,
    ip?: string,
    userAgent?: string,
  ): Promise<AuthTokens> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: `${this.ACCESS_TOKEN_EXPIRY}s`,
    });

    const rawRefreshToken = crypto.randomUUID() + '-' + crypto.randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(rawRefreshToken);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.REFRESH_TOKEN_EXPIRY_DAYS);

    const refreshTokenEntity = this.refreshTokenRepository.create({
      userId: user.id,
      tokenHash,
      expiresAt,
      isRevoked: false,
      ipAddress: ip,
      userAgent,
    });
    await this.refreshTokenRepository.save(refreshTokenEntity);

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      expiresIn: this.ACCESS_TOKEN_EXPIRY,
    };
  }
}
