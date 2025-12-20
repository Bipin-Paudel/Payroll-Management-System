import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { CompanyModule } from "./company/company.module";
import { CommonModule } from "./common/common.module";
import { RolesModule } from "./roles/roles.module";
import { DepartmentsModule } from "./departments/departments.module";
import { PaymentMethodsModule } from "./payment-methods/payment-methods.module";
import { EmployeesModule } from "./employees/employees.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), //  loads .env everywhere

    PrismaModule,
    AuthModule,
    CompanyModule,
    CommonModule,
    RolesModule,
    DepartmentsModule,
    PaymentMethodsModule,
    EmployeesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
