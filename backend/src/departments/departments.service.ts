import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CompanyService } from "../company/company.service";
import { CreateDepartmentDto } from "./dto/create-department.dto";
import { UpdateDepartmentDto } from "./dto/update-department.dto";

@Injectable()
export class DepartmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly companyService: CompanyService
  ) {}

  private async getCompanyId(userId: string) {
    const company = await this.companyService.getMyCompany(userId);
    if (!company) throw new NotFoundException("Company not found for this user.");
    return company.id;
  }

  async create(userId: string, dto: CreateDepartmentDto) {
    const companyId = await this.getCompanyId(userId);

    try {
      return await this.prisma.department.create({
        data: {
          companyId,
          name: dto.name.trim(),
          description: dto.description?.trim() || null,
        },
      });
    } catch (e: any) {
      // unique constraint duplicate name
      throw new BadRequestException("Department name already exists.");
    }
  }

  async list(userId: string) {
    const companyId = await this.getCompanyId(userId);

    return this.prisma.department.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
    });
  }

  async update(userId: string, id: string, dto: UpdateDepartmentDto) {
    const companyId = await this.getCompanyId(userId);

    const existing = await this.prisma.department.findFirst({
      where: { id, companyId },
    });
    if (!existing) throw new NotFoundException("Department not found.");

    try {
      return await this.prisma.department.update({
        where: { id },
        data: {
          name: dto.name ? dto.name.trim() : undefined,
          description:
            dto.description !== undefined ? dto.description.trim() || null : undefined,
        },
      });
    } catch (e: any) {
      throw new BadRequestException("Department name already exists.");
    }
  }

  async remove(userId: string, id: string) {
    const companyId = await this.getCompanyId(userId);

    const existing = await this.prisma.department.findFirst({
      where: { id, companyId },
    });
    if (!existing) throw new NotFoundException("Department not found.");

    await this.prisma.department.delete({ where: { id } });
    return { success: true };
  }
}
