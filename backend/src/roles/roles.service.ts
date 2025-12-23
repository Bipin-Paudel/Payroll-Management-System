import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateRoleDto } from "./dto/create-role.dto";
import { UpdateRoleDto } from "./dto/update-role.dto";

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreateRoleDto) {
    const name = dto.name?.trim();
    if (!name) throw new BadRequestException("Role name is required.");

    try {
      return await this.prisma.role.create({
        data: {
          companyId,
          name,
          description: dto.description?.trim() || null,
        },
      });
    } catch (e: any) {
      // Unique constraint duplicate name (company-scoped)
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2002"
      ) {
        throw new ConflictException("Role name already exists.");
      }
      throw e;
    }
  }

  async list(companyId: string) {
    return this.prisma.role.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
    });
  }

  async update(companyId: string, id: string, dto: UpdateRoleDto) {
    // Ownership + existence check
    const existing = await this.prisma.role.findFirst({
      where: { id, companyId },
      select: { id: true },
    });
    if (!existing) throw new NotFoundException("Role not found.");

    try {
      return await this.prisma.role.update({
        where: { id },
        data: {
          name: dto.name ? dto.name.trim() : undefined,
          description:
            dto.description !== undefined
              ? dto.description.trim() || null
              : undefined,
        },
      });
    } catch (e: any) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2002"
      ) {
        throw new ConflictException("Role name already exists.");
      }
      throw e;
    }
  }

  async remove(companyId: string, id: string) {
    // Ownership + existence check
    const existing = await this.prisma.role.findFirst({
      where: { id, companyId },
      select: { id: true },
    });
    if (!existing) throw new NotFoundException("Role not found.");

    // Block delete if role is used by any employee
    const usedCount = await this.prisma.employee.count({
      where: { companyId, roleId: id },
    });

    if (usedCount > 0) {
      throw new ConflictException(
        `Cannot delete this role because it is assigned to ${usedCount} employee(s). Reassign them to another role first.`
      );
    }

    // Safe delete
    await this.prisma.role.delete({ where: { id } });
    return { success: true };
  }
}
