import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_ACCESS_SECRET || "access_dev_secret_change_me",
    });
  }

  async validate(payload: any) {
    // ✅ userId must always exist
    if (!payload?.sub) {
      throw new UnauthorizedException("Invalid token");
    }

    // ✅ companyId can be null until company is created
    const companyId =
      payload.companyId === undefined ? null : (payload.companyId ?? null);

    return {
      id: payload.sub,
      email: payload.email,
      companyId, // string | null
    };
  }
}
