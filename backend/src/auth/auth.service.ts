import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
  ConflictException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { SignupDto } from "./dto/signup.dto";
import { LoginDto } from "./dto/login.dto";
import { Prisma } from "@prisma/client";

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  private accessSecret =
    process.env.JWT_ACCESS_SECRET || "access_dev_secret_change_me";
  private refreshSecret =
    process.env.JWT_REFRESH_SECRET || "refresh_dev_secret_change_me";

  /**
   * access: 15 minutes (default)
   * refresh: 30 days (default)
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

  // ✅ companyId can be null until user creates company
  private signAccessToken(userId: string, email: string, companyId: string | null) {
    return this.jwt.sign(
      { sub: userId, email, companyId: companyId ?? null },
      { secret: this.accessSecret, expiresIn: this.accessExpiresSec }
    );
  }

  // ✅ companyId can be null until user creates company
  private signRefreshToken(userId: string, email: string, companyId: string | null) {
    return this.jwt.sign(
      { sub: userId, email, companyId: companyId ?? null },
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

  // ✅ SAFE: returns companyId or null (NO THROW)
  private async getCompanyIdByUserId(userId: string): Promise<string | null> {
    const company = await this.prisma.company.findUnique({
      where: { userId },
      select: { id: true },
    });

    return company?.id ?? null;
  }

  async signup(dto: SignupDto) {
    const email = dto.email.trim().toLowerCase();

    const exists = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (exists) throw new ConflictException("Email already in use");

    const hashedPassword = await this.hash(dto.password);

    try {
      const user = await this.prisma.user.create({
        data: {
          email,
          password: hashedPassword,
        },
        select: { id: true, email: true },
      });

      // ✅ No company created here (as you requested)
      // User will login and then create company from /company/info
      return {
        user,
        message: "Signup successful. Please login to create your company.",
      };
    } catch (e: any) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        throw new ConflictException("Email already in use");
      }
      throw new BadRequestException("Unable to signup user");
    }
  }

  async login(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, password: true },
    });
    if (!user) throw new UnauthorizedException("Invalid credentials");

    const ok = await this.verifyHash(dto.password, user.password);
    if (!ok) throw new UnauthorizedException("Invalid credentials");

    // ✅ companyId can be null for new users
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
