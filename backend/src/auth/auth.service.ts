import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { SignupDto } from "./dto/signup.dto";
import { LoginDto } from "./dto/login.dto";

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  private accessSecret =
    process.env.JWT_ACCESS_SECRET || "access_dev_secret_change_me";
  private refreshSecret =
    process.env.JWT_REFRESH_SECRET || "refresh_dev_secret_change_me";

  /**
   * ✅ IMPORTANT DEFAULTS
   * access: seen by frontend like normal session (15 minutes)
   * refresh: long lived (30 days)
   */
  private accessExpiresSec =
    Number(process.env.JWT_ACCESS_EXPIRES_SEC) || 15 * 60;

  private refreshExpiresSec =
    Number(process.env.JWT_REFRESH_EXPIRES_SEC) || 30 * 24 * 60 * 60;

  private async hash(value: string) {
    return bcrypt.hash(value, 10);
  }

  private async verifyHash(value: string, hash: string) {
    return bcrypt.compare(value, hash);
  }

  private signAccessToken(userId: string, email: string, companyId: string) {
    return this.jwt.sign(
      { sub: userId, email, companyId },
      { secret: this.accessSecret, expiresIn: this.accessExpiresSec }
    );
  }

  private signRefreshToken(userId: string, email: string, companyId: string) {
    return this.jwt.sign(
      { sub: userId, email, companyId },
      { secret: this.refreshSecret, expiresIn: this.refreshExpiresSec }
    );
  }

  private async setRefreshToken(userId: string, refreshToken: string) {
    const hashedRt = await this.hash(refreshToken);
    await this.prisma.user.update({
      where: { id: userId },
      data: { hashedRt },
    });
  }

  private async getCompanyIdByUserId(userId: string): Promise<string> {
    const company = await this.prisma.company.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!company?.id) {
      throw new UnauthorizedException("Company not found for this user");
    }

    return company.id;
  }

  async signup(dto: SignupDto) {
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: { id: true },
    });
    if (exists) throw new BadRequestException("Email already in use");

    const hashedPassword = await this.hash(dto.password);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
      },
      select: { id: true, email: true },
    });

    // ✅ No company yet -> do not issue tokens until company exists
    return {
      user,
      message: "Signup successful. Please create your company to continue.",
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: { id: true, email: true, password: true },
    });
    if (!user) throw new UnauthorizedException("Invalid credentials");

    const ok = await this.verifyHash(dto.password, user.password);
    if (!ok) throw new UnauthorizedException("Invalid credentials");

    const companyId = await this.getCompanyIdByUserId(user.id);

    const access_token = this.signAccessToken(user.id, user.email, companyId);
    const refresh_token = this.signRefreshToken(user.id, user.email, companyId);

    await this.setRefreshToken(user.id, refresh_token);

    return {
      user: { id: user.id, email: user.email, companyId },
      access_token,
      refresh_token,
    };
  }

  /**
   * ✅ Refresh flow (SECURE + ROTATION)
   * RtGuard verifies refresh signature.
   * Here we additionally verify refreshToken matches stored hashedRt.
   */
  async refresh(userId: string, refreshToken: string) {
    if (!refreshToken) throw new UnauthorizedException("Missing refresh token");
    if (!userId) throw new UnauthorizedException("Missing user");

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, hashedRt: true },
    });

    if (!user || !user.hashedRt) {
      throw new UnauthorizedException("Refresh not allowed");
    }

    const matches = await this.verifyHash(refreshToken, user.hashedRt);
    if (!matches) throw new UnauthorizedException("Refresh not allowed");

    const companyId = await this.getCompanyIdByUserId(user.id);

    const new_access_token = this.signAccessToken(user.id, user.email, companyId);
    const new_refresh_token = this.signRefreshToken(user.id, user.email, companyId);

    await this.setRefreshToken(user.id, new_refresh_token);

    return {
      access_token: new_access_token,
      refresh_token: new_refresh_token,
    };
  }

  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { hashedRt: null },
    });

    return { success: true };
  }
}
