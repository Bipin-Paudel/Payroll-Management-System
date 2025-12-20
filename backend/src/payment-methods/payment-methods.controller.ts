import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { JwtGuard } from "../common/guards/jwt.guard";
import { PaymentMethodsService } from "./payment-methods.service";
import { CreatePaymentMethodDto } from "./dto/create-payment-method.dto";
import { UpdatePaymentMethodDto } from "./dto/update-payment-method.dto";

@UseGuards(JwtGuard)
@Controller("payment-methods")
export class PaymentMethodsController {
  constructor(private readonly service: PaymentMethodsService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreatePaymentMethodDto) {
    return this.service.create(req.user.id, dto);
  }

  @Get()
  list(@Req() req: any) {
    return this.service.list(req.user.id);
  }

  @Patch(":id")
  update(
    @Req() req: any,
    @Param("id") id: string,
    @Body() dto: UpdatePaymentMethodDto
  ) {
    return this.service.update(req.user.id, id, dto);
  }

  @Delete(":id")
  remove(@Req() req: any, @Param("id") id: string) {
    return this.service.remove(req.user.id, id);
  }
}
