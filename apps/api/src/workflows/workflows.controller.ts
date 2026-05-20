import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { WorkflowsService } from './workflows.service';
import { CreateWorkflowDto, UpdateWorkflowDto } from './dto/workflow.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('workflows')
@UseGuards(JwtAuthGuard)
export class WorkflowsController {
  constructor(private workflowsService: WorkflowsService) {}

  @Post()
  async create(@Body() createWorkflowDto: CreateWorkflowDto, @Request() req) {
    const workspaceId = req.user.workspaceId || req.body.workspaceId;
    return this.workflowsService.create(workspaceId, createWorkflowDto);
  }

  @Get()
  async findAll(@Request() req) {
    const workspaceId = req.user.workspaceId || req.query.workspaceId;
    return this.workflowsService.findAll(workspaceId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.workflowsService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateWorkflowDto: UpdateWorkflowDto) {
    return this.workflowsService.update(id, updateWorkflowDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.workflowsService.remove(id);
  }

  @Post(':id/toggle')
  async toggle(@Param('id') id: string) {
    return this.workflowsService.toggle(id);
  }

  @Post(':id/execute')
  async execute(@Param('id') id: string, @Body() body: any) {
    return this.workflowsService.execute(id, body.input);
  }

  @Get(':id/executions')
  async getExecutions(@Param('id') id: string) {
    return this.workflowsService.getExecutions(id);
  }
}
