import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateEmployeeDto } from "./dto/create-employee.dto";
import { UpdateEmployeeDto } from "./dto/update-employee.dto";

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  private parseAdDate(dateStr?: string | null): Date | null {
  if (!dateStr) return null;

  // 🔒 Force local date (NO timezone shift)
  const d = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(d.getTime())) return null;

  return d;
}

  private async assertDeptAndRoleBelongToCompany(
    companyId: string,
    departmentId: string,
    roleId: string,
  ) {
    const [dept, role] = await Promise.all([
      this.prisma.department.findFirst({ where: { id: departmentId, companyId } }),
      this.prisma.role.findFirst({ where: { id: roleId, companyId } }),
    ]);

    if (!dept) throw new NotFoundException("Department not found.");
    if (!role) throw new NotFoundException("Role not found.");
  }

  async create(companyId: string, dto: CreateEmployeeDto) {
    await this.assertDeptAndRoleBelongToCompany(companyId, dto.departmentId, dto.roleId);

    try {
      return await this.prisma.employee.create({
        data: {
          companyId,
          departmentId: dto.departmentId,
          roleId: dto.roleId,
          name: dto.name.trim(),
          panNo: dto.panNo?.trim() || null,
          gender: dto.gender as any,
          disability: dto.disability ?? false,
          dateOfJoiningAd: this.parseAdDate(dto.dateOfJoiningAd),
          dateOfJoiningBs: dto.dateOfJoiningBs || null,
          lifeInsurance: dto.lifeInsurance ?? 0,
          healthInsurance: dto.healthInsurance ?? 0,
          houseInsurance: dto.houseInsurance ?? 0,
        },
        include: {
          department: { select: { id: true, name: true } },
          role: { select: { id: true, name: true } },
        },
      });
    } catch (e: any) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        // unique conflict (companyId, panNo)
        throw new ConflictException("Employee PAN No already exists in this company.");
      }
      throw e;
    }
  }

  async findAll(companyId: string) {
    return this.prisma.employee.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      include: {
        department: { select: { id: true, name: true } },
        role: { select: { id: true, name: true } },
      },
    });
  }

  async findOne(companyId: string, id: string) {
    const emp = await this.prisma.employee.findFirst({
      where: { id, companyId },
      include: {
        department: { select: { id: true, name: true } },
        role: { select: { id: true, name: true } },
      },
    });

    if (!emp) throw new NotFoundException("Employee not found.");
    return emp;
  }

  async update(companyId: string, id: string, dto: UpdateEmployeeDto) {
    const existing = await this.prisma.employee.findFirst({ where: { id, companyId } });
    if (!existing) throw new NotFoundException("Employee not found.");

    // If departmentId/roleId changes, verify ownership in this company
    const nextDepartmentId = dto.departmentId ?? existing.departmentId;
    const nextRoleId = dto.roleId ?? existing.roleId;
    await this.assertDeptAndRoleBelongToCompany(companyId, nextDepartmentId, nextRoleId);

    try {
      return await this.prisma.employee.update({
        where: { id },
        data: {
          departmentId: dto.departmentId ?? undefined,
          roleId: dto.roleId ?? undefined,
          name: dto.name ? dto.name.trim() : undefined,
          panNo: dto.panNo === null ? null : dto.panNo ? dto.panNo.trim() : undefined,
          gender: dto.gender ? (dto.gender as any) : undefined,
          disability: typeof dto.disability === "boolean" ? dto.disability : undefined,
          dateOfJoiningAd:
            dto.dateOfJoiningAd === null
              ? null
              : dto.dateOfJoiningAd
                ? this.parseAdDate(dto.dateOfJoiningAd)
                : undefined,
          dateOfJoiningBs:
            dto.dateOfJoiningBs === null ? null : dto.dateOfJoiningBs ?? undefined,
          lifeInsurance: typeof dto.lifeInsurance === "number" ? dto.lifeInsurance : undefined,
          healthInsurance: typeof dto.healthInsurance === "number" ? dto.healthInsurance : undefined,
          houseInsurance: typeof dto.houseInsurance === "number" ? dto.houseInsurance : undefined,
        },
        include: {
          department: { select: { id: true, name: true } },
          role: { select: { id: true, name: true } },
        },
      });
    } catch (e: any) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        throw new ConflictException("Employee PAN No already exists in this company.");
      }
      throw e;
    }
  }

  async remove(companyId: string, id: string) {
    const existing = await this.prisma.employee.findFirst({ where: { id, companyId } });
    if (!existing) throw new NotFoundException("Employee not found.");

    await this.prisma.employee.delete({ where: { id } });
    return { message: "Employee deleted successfully." };
  }
}
