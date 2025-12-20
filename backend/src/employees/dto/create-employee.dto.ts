import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from "class-validator";

export enum GenderDto {
  MALE = "MALE",
  FEMALE = "FEMALE",
  OTHER = "OTHER",
}

export class CreateEmployeeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  panNo?: string | null;

  @IsString()
  @IsNotEmpty()
  departmentId: string;

  @IsString()
  @IsNotEmpty()
  roleId: string;

  @IsEnum(GenderDto)
  gender: GenderDto;

  @IsOptional()
  @IsBoolean()
  disability?: boolean;

  // accept ISO string from frontend (your form sends string or null)
  @IsOptional()
  @IsString()
  dateOfJoiningAd?: string | null;

  @IsOptional()
  @IsString()
  dateOfJoiningBs?: string | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  lifeInsurance?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  healthInsurance?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  houseInsurance?: number;
}
