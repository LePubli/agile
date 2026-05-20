import { IsString, IsNotEmpty, IsOptional, IsObject, IsBoolean } from 'class-validator';

export class CreateWorkflowDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsObject()
  @IsNotEmpty()
  trigger: Record<string, any>;

  @IsObject()
  @IsNotEmpty()
  actions: Record<string, any>;

  @IsBoolean()
  @IsOptional()
  enabled?: boolean;

  @IsString()
  @IsOptional()
  schedule?: string;
}

export class UpdateWorkflowDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsObject()
  @IsOptional()
  trigger?: Record<string, any>;

  @IsObject()
  @IsOptional()
  actions?: Record<string, any>;

  @IsBoolean()
  @IsOptional()
  enabled?: boolean;

  @IsString()
  @IsOptional()
  schedule?: string;
}
