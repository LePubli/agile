import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AiService } from './ai.service';
import { CreateAiTaskDto, CreateAIAgentDto } from './dto/ai.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private aiService: AiService) {}

  @Post('tasks')
  async createTask(@Body() createTaskDto: CreateAiTaskDto, @Request() req) {
    return this.aiService.createTask(req.user.tenantId, createTaskDto);
  }

  @Get('tasks')
  async getTasks(@Request() req) {
    return this.aiService.getTasks(req.user.tenantId);
  }

  @Get('tasks/:id')
  async getTask(@Param('id') id: string) {
    return this.aiService.getTask(id);
  }

  @Post('agents')
  async createAgent(@Body() createAgentDto: CreateAIAgentDto, @Request() req) {
    return this.aiService.createAgent(req.user.tenantId, createAgentDto);
  }

  @Get('agents')
  async getAgents(@Request() req) {
    return this.aiService.getAgents(req.user.tenantId);
  }

  @Get('agents/:id')
  async getAgent(@Param('id') id: string) {
    return this.aiService.getAgent(id);
  }

  @Put('agents/:id')
  async updateAgent(@Param('id') id: string, @Body() updates: any) {
    return this.aiService.updateAgent(id, updates);
  }

  @Delete('agents/:id')
  async deleteAgent(@Param('id') id: string) {
    return this.aiService.deleteAgent(id);
  }

  @Post('agents/:id/toggle')
  async toggleAgent(@Param('id') id: string) {
    return this.aiService.toggleAgent(id);
  }
}
