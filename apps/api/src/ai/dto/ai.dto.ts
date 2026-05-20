import { IsString, IsNotEmpty, IsOptional, IsObject, IsEnum, IsArray } from 'class-validator';
import { AITaskType, AIProvider } from '@prisma/client';

export class CreateAiTaskDto {
  @IsEnum(AITaskType)
  @IsNotEmpty()
  type: AITaskType;

  @IsEnum(AIProvider)
  @IsNotEmpty()
  provider: AIProvider;

  @IsString()
  @IsNotEmpty()
  model: string;

  @IsObject()
  @IsNotEmpty()
  input: Record<string, any>;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

export class CreateAIAgentDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  systemPrompt: string;

  @IsArray()
  @IsOptional()
  tools?: any[];

  @IsString()
  @IsNotEmpty()
  model: string;

  @IsEnum(AIProvider)
  @IsNotEmpty()
  provider: AIProvider;

  @IsObject()
  @IsOptional()
  settings?: Record<string, any>;
}
