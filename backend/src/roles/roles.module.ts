import { Module } from "@nestjs/common";
import { RolesController } from "./roles.controller";
import { RolesService } from "./roles.service";
import { CompanyModule } from "../company/company.module";
import { PrismaModule } from "src/prisma/prisma.module";

@Module({
  imports: [PrismaModule, CompanyModule],
  controllers: [RolesController],
  providers: [RolesService],
})
export class RolesModule {}
