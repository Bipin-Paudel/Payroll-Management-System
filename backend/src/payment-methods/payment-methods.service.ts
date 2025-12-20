import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CompanyService } from "../company/company.service";
import { CreatePaymentMethodDto } from "./dto/create-payment-method.dto";
import { UpdatePaymentMethodDto } from "./dto/update-payment-method.dto";

@Injectable()
export class PaymentMethodsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly companyService: CompanyService
  ) {}

  private async getCompanyId(userId: string) {
    const company = await this.companyService.getMyCompany(userId);
    if (!company) throw new NotFoundException("Company not found for this user.");
    return company.id;
  }

  async create(userId: string, dto: CreatePaymentMethodDto) {
    const companyId = await this.getCompanyId(userId);

    try {
      return await this.prisma.paymentMethod.create({
        data: {
          companyId,
          name: dto.name.trim(),
          description: dto.description?.trim() || null,
        },
      });
    } catch (e: any) {
      throw new BadRequestException("Payment method name already exists.");
    }
  }

  async list(userId: string) {
    const companyId = await this.getCompanyId(userId);

    return this.prisma.paymentMethod.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
    });
  }

  async update(userId: string, id: string, dto: UpdatePaymentMethodDto) {
    const companyId = await this.getCompanyId(userId);

    const existing = await this.prisma.paymentMethod.findFirst({
      where: { id, companyId },
    });
    if (!existing) throw new NotFoundException("Payment method not found.");

    try {
      return await this.prisma.paymentMethod.update({
        where: { id },
        data: {
          name: dto.name ? dto.name.trim() : undefined,
          description:
            dto.description !== undefined ? dto.description.trim() || null : undefined,
        },
      });
    } catch (e: any) {
      throw new BadRequestException("Payment method name already exists.");
    }
  }

  async remove(userId: string, id: string) {
    const companyId = await this.getCompanyId(userId);

    const existing = await this.prisma.paymentMethod.findFirst({
      where: { id, companyId },
    });
    if (!existing) throw new NotFoundException("Payment method not found.");

    await this.prisma.paymentMethod.delete({ where: { id } });
    return { success: true };
  }
}
