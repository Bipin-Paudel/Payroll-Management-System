import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateCompanyDto } from "./dto/create-company.dto";

@Injectable()
export class CompanyService {
  constructor(private prisma: PrismaService) {}

  async getMyCompany(userId: string) {
    // ✅ company can be null (new user)
    return this.prisma.company.findUnique({ where: { userId } });
  }

  async createMyCompany(userId: string, dto: CreateCompanyDto) {
    const existing = await this.prisma.company.findUnique({ where: { userId } });
    if (existing) {
      throw new BadRequestException("Company already exists for this user");
    }

    try {
      return await this.prisma.company.create({
        data: { ...dto, userId },
      });
    } catch {
      throw new BadRequestException(
        "Could not create company. Check PAN/VAT uniqueness."
      );
    }
  }

  async updateMyCompany(userId: string, dto: any) {
    const company = await this.prisma.company.findUnique({ where: { userId } });

    if (!company) {
      throw new NotFoundException("Company not found for this user.");
    }

    return this.prisma.company.update({
      where: { id: company.id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.entityType !== undefined ? { entityType: dto.entityType } : {}),
        ...(dto.panVat !== undefined ? { panVat: dto.panVat } : {}),
        ...(dto.address !== undefined ? { address: dto.address } : {}),
        ...(dto.phone !== undefined ? { phone: dto.phone } : {}),
        ...(dto.email !== undefined ? { email: dto.email } : {}),
      },
    });
  }
}
