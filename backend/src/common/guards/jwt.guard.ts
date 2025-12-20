import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(private jwt: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();

    const auth = req.headers["authorization"] || "";
    const [type, token] = String(auth).split(" ");

    if (type !== "Bearer" || !token) {
      throw new UnauthorizedException("Missing token");
    }

    try {
      const secret =
        process.env.JWT_ACCESS_SECRET || "access_dev_secret_change_me";

      const payload = this.jwt.verify(token, { secret });

      // ✅ Attach companyId (multi-tenant)
      req.user = {
        id: payload.sub,
        email: payload.email,
        companyId: payload.companyId,
      };

      return true;
    } catch {
      throw new UnauthorizedException("Invalid token");
    }
  }
}
