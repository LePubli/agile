import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';

export class CreatePluginDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  displayName: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  version: string;

  @IsString()
  @IsOptional()
  author?: string;

  @IsString()
  @IsOptional()
  repository?: string;

  @IsObject()
  @IsOptional()
  manifest?: Record<string, any>;
}

export class InstallPluginDto {
  @IsString()
  @IsNotEmpty()
  pluginId: string;
}
