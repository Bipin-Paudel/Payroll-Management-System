import { Global, Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { JwtStrategy } from "./strategies/jwt.strategy";

@Global()
@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET || "access_dev_secret_change_me",
    }),
  ],
  providers: [JwtStrategy],
  exports: [JwtModule],
})
export class CommonModule {}
