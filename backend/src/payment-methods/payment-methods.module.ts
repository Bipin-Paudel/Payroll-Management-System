import { Module } from "@nestjs/common";
import { PaymentMethodsController } from "./payment-methods.controller";
import { PaymentMethodsService } from "./payment-methods.service";
import { PrismaModule } from "../prisma/prisma.module";
import { CompanyModule } from "../company/company.module";

@Module({
  imports: [PrismaModule, CompanyModule],
  controllers: [PaymentMethodsController],
  providers: [PaymentMethodsService],
})
export class PaymentMethodsModule {}
