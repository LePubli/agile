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
import { PluginsService } from './plugins.service';
import { CreatePluginDto } from './dto/plugin.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('plugins')
@UseGuards(JwtAuthGuard)
export class PluginsController {
  constructor(private pluginsService: PluginsService) {}

  @Post()
  async create(@Body() createPluginDto: CreatePluginDto) {
    return this.pluginsService.create(createPluginDto);
  }

  @Get()
  async findAll() {
    return this.pluginsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.pluginsService.findOne(id);
  }

  @Post(':id/install')
  async install(@Param('id') pluginId: string, @Request() req) {
    const tenantId = req.user.tenantId;
    return this.pluginsService.install(tenantId, pluginId);
  }

  @Post(':id/activate')
  async activate(@Param('id') pluginId: string, @Request() req) {
    const tenantId = req.user.tenantId;
    return this.pluginsService.activate(tenantId, pluginId);
  }

  @Post(':id/deactivate')
  async deactivate(@Param('id') pluginId: string, @Request() req) {
    const tenantId = req.user.tenantId;
    return this.pluginsService.deactivate(tenantId, pluginId);
  }

  @Delete(':id/uninstall')
  async uninstall(@Param('id') pluginId: string, @Request() req) {
    const tenantId = req.user.tenantId;
    return this.pluginsService.uninstall(tenantId, pluginId);
  }

  @Get('tenant/:tenantId')
  async getTenantPlugins(@Param('tenantId') tenantId: string) {
    return this.pluginsService.getTenantPlugins(tenantId);
  }
}
