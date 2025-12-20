import { Module } from "@nestjs/common";
import { DepartmentsController } from "./departments.controller";
import { DepartmentsService } from "./departments.service";
import { PrismaModule } from "../prisma/prisma.module";
import { CompanyModule } from "../company/company.module";

@Module({
  imports: [PrismaModule, CompanyModule],
  controllers: [DepartmentsController],
  providers: [DepartmentsService],
})
export class DepartmentsModule {}
