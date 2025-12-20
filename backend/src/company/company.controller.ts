import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Req,
  UseGuards,
} from "@nestjs/common";
import { JwtGuard } from "../common/guards/jwt.guard";
import { CompanyService } from "./company.service";
import { CreateCompanyDto } from "./dto/create-company.dto";
import { UpdateCompanyDto } from "./dto/update-company.dto";

@UseGuards(JwtGuard)
@Controller("company")
export class CompanyController {
  constructor(private service: CompanyService) {}

  @Get("me")
  me(@Req() req: any) {
    return this.service.getMyCompany(req.user.id);
  }

  @Post()
  create(@Req() req: any, @Body() dto: CreateCompanyDto) {
    return this.service.createMyCompany(req.user.id, dto);
  }


  @Patch("me")
  updateMe(@Req() req: any, @Body() dto: UpdateCompanyDto) {
    return this.service.updateMyCompany(req.user.id, dto);
  }
}
