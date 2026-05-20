import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAiTaskDto, CreateAIAgentDto } from './dto/ai.dto';

@Injectable()
export class AiService {
  constructor(private prisma: PrismaService) {}

  async createTask(tenantId: string, createTaskDto: CreateAiTaskDto) {
    const task = await this.prisma.aITask.create({
      data: {
        tenantId,
        type: createTaskDto.type,
        provider: createTaskDto.provider,
        model: createTaskDto.model,
        input: createTaskDto.input,
        status: 'PENDING',
        metadata: createTaskDto.metadata || {},
      },
    });

    // In a real implementation, this would queue the task for processing
    // For now, we just create the record and return it

    return task;
  }

  async getTasks(tenantId: string, status?: string) {
    const where: any = { tenantId };
    if (status) {
      where.status = status;
    }

    return this.prisma.aITask.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async getTask(id: string) {
    const task = await this.prisma.aITask.findUnique({
      where: { id },
    });

    if (!task) {
      throw new NotFoundException('AI task not found');
    }

    return task;
  }

  async createAgent(tenantId: string, createAgentDto: CreateAIAgentDto) {
    const agent = await this.prisma.aIAgent.create({
      data: {
        tenantId,
        name: createAgentDto.name,
        description: createAgentDto.description,
        systemPrompt: createAgentDto.systemPrompt,
        tools: createAgentDto.tools || [],
        model: createAgentDto.model,
        provider: createAgentDto.provider,
        settings: createAgentDto.settings || {},
      },
    });

    return agent;
  }

  async getAgents(tenantId: string) {
    return this.prisma.aIAgent.findMany({
      where: { tenantId, enabled: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAgent(id: string) {
    const agent = await this.prisma.aIAgent.findUnique({
      where: { id },
    });

    if (!agent) {
      throw new NotFoundException('AI agent not found');
    }

    return agent;
  }

  async updateAgent(id: string, updates: Partial<any>) {
    return this.prisma.aIAgent.update({
      where: { id },
      data: updates,
    });
  }

  async deleteAgent(id: string) {
    await this.prisma.aIAgent.delete({
      where: { id },
    });

    return { message: 'AI agent deleted successfully' };
  }

  async toggleAgent(id: string) {
    const agent = await this.prisma.aIAgent.findUnique({
      where: { id },
    });

    if (!agent) {
      throw new NotFoundException('AI agent not found');
    }

    return this.prisma.aIAgent.update({
      where: { id },
      data: { enabled: !agent.enabled },
    });
  }
}
