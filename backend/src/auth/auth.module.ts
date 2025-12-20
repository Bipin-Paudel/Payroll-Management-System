import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { PrismaService } from "../prisma/prisma.service";
import { RtStrategy } from "src/common/strategies/rt.strategy";

@Module({
  imports: [
    // JwtService is used by AuthService, but we sign with custom secrets inside AuthService.
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [AuthService, PrismaService, RtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
