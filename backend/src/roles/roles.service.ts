import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CompanyService } from "../company/company.service";
import { CreateRoleDto } from "./dto/create-role.dto";
import { UpdateRoleDto } from "./dto/update-role.dto";

@Injectable()
export class RolesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly companyService: CompanyService
  ) {}

  private async getCompanyId(userId: string) {
    const company = await this.companyService.getMyCompany(userId);
    if (!company) throw new NotFoundException("Company not found for this user.");
    return company.id;
  }

  async create(userId: string, dto: CreateRoleDto) {
    const companyId = await this.getCompanyId(userId);

    try {
      return await this.prisma.role.create({
        data: {
          companyId,
          name: dto.name.trim(),
          description: dto.description?.trim() || null,
        },
      });
    } catch (e: any) {
      // Unique constraint duplicate name
      throw new BadRequestException("Role name already exists.");
    }
  }

  async list(userId: string) {
    const companyId = await this.getCompanyId(userId);

    return this.prisma.role.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
    });
  }

  async update(userId: string, id: string, dto: UpdateRoleDto) {
    const companyId = await this.getCompanyId(userId);

    const existing = await this.prisma.role.findFirst({
      where: { id, companyId },
    });
    if (!existing) throw new NotFoundException("Role not found.");

    try {
      return await this.prisma.role.update({
        where: { id },
        data: {
          name: dto.name ? dto.name.trim() : undefined,
          description: dto.description !== undefined ? dto.description.trim() || null : undefined,
        },
      });
    } catch (e: any) {
      throw new BadRequestException("Role name already exists.");
    }
  }

  async remove(userId: string, id: string) {
    const companyId = await this.getCompanyId(userId);

    const existing = await this.prisma.role.findFirst({
      where: { id, companyId },
    });
    if (!existing) throw new NotFoundException("Role not found.");

    await this.prisma.role.delete({ where: { id } });
    return { success: true };
  }
}
