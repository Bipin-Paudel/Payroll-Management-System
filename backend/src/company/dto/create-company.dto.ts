import { EntityType } from "@prisma/client";
import { IsEmail, IsEnum, IsOptional, IsString } from "class-validator";

export class CreateCompanyDto {
  @IsString()
  name: string;

  @IsEnum(EntityType)
  entityType: EntityType;

  @IsString()
  panVat: string;

  @IsString()
  address: string;

  @IsString()
  phone: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}
