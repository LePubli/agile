import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkflowDto, UpdateWorkflowDto } from './dto/workflow.dto';

@Injectable()
export class WorkflowsService {
  constructor(private prisma: PrismaService) {}

  async create(workspaceId: string, createWorkflowDto: CreateWorkflowDto) {
    const workflow = await this.prisma.workflow.create({
      data: {
        workspaceId,
        name: createWorkflowDto.name,
        description: createWorkflowDto.description,
        trigger: createWorkflowDto.trigger,
        actions: createWorkflowDto.actions,
        enabled: createWorkflowDto.enabled ?? true,
        schedule: createWorkflowDto.schedule,
      },
    });

    return workflow;
  }

  async findAll(workspaceId: string) {
    return this.prisma.workflow.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const workflow = await this.prisma.workflow.findUnique({
      where: { id },
      include: {
        executions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!workflow) {
      throw new NotFoundException('Workflow not found');
    }

    return workflow;
  }

  async update(id: string, updateWorkflowDto: UpdateWorkflowDto) {
    const workflow = await this.prisma.workflow.update({
      where: { id },
      data: updateWorkflowDto,
    });

    return workflow;
  }

  async remove(id: string) {
    await this.prisma.workflow.delete({
      where: { id },
    });

    return { message: 'Workflow deleted successfully' };
  }

  async toggle(id: string) {
    const workflow = await this.prisma.workflow.findUnique({
      where: { id },
    });

    if (!workflow) {
      throw new NotFoundException('Workflow not found');
    }

    return this.prisma.workflow.update({
      where: { id },
      data: { enabled: !workflow.enabled },
    });
  }

  async execute(id: string, input?: any) {
    const workflow = await this.prisma.workflow.findUnique({
      where: { id },
    });

    if (!workflow) {
      throw new NotFoundException('Workflow not found');
    }

    const execution = await this.prisma.workflowExecution.create({
      data: {
        workflowId: id,
        status: 'PENDING',
        input,
      },
    });

    // In a real implementation, this would trigger the workflow engine
    // For now, we just create the execution record

    return execution;
  }

  async getExecutions(workflowId: string) {
    return this.prisma.workflowExecution.findMany({
      where: { workflowId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }
}
