import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { PlanType } from '@prisma/client';

export class CreateTenantDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsEnum(PlanType)
  @IsOptional()
  plan?: PlanType;
}

export class UpdateTenantDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(PlanType)
  @IsOptional()
  plan?: PlanType;

  @IsString()
  @IsOptional()
  status?: string;
}
