import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

type RtPayload = {
  sub: string;
  email: string;
  companyId: string;
};

@Injectable()
export class RtStrategy extends PassportStrategy(Strategy, "jwt-refresh") {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey:
        process.env.JWT_REFRESH_SECRET || "refresh_dev_secret_change_me",
      ignoreExpiration: false,
      passReqToCallback: true,
    });
  }

  validate(req: any, payload: RtPayload) {
    const auth = req.headers?.authorization || "";
    const [, refreshToken] = String(auth).split(" ");

    if (!payload?.sub || !payload?.email || !payload?.companyId) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    if (!refreshToken) {
      throw new UnauthorizedException("Missing refresh token");
    }

    return {
      id: payload.sub,
      email: payload.email,
      companyId: payload.companyId,
      refreshToken,
    };
  }
}
