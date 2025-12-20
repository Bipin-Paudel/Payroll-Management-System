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
import { RolesService } from "./roles.service";
import { CreateRoleDto } from "./dto/create-role.dto";
import { UpdateRoleDto } from "./dto/update-role.dto";

@UseGuards(JwtGuard)
@Controller("roles")
export class RolesController {
  constructor(private readonly service: RolesService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateRoleDto) {
    return this.service.create(req.user.id, dto);
  }

  @Get()
  list(@Req() req: any) {
    return this.service.list(req.user.id);
  }

  @Patch(":id")
  update(@Req() req: any, @Param("id") id: string, @Body() dto: UpdateRoleDto) {
    return this.service.update(req.user.id, id, dto);
  }

  @Delete(":id")
  remove(@Req() req: any, @Param("id") id: string) {
    return this.service.remove(req.user.id, id);
  }
}
