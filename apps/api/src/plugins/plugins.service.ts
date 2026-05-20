import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePluginDto, InstallPluginDto } from './dto/plugin.dto';

@Injectable()
export class PluginsService {
  constructor(private prisma: PrismaService) {}

  async create(createPluginDto: CreatePluginDto) {
    const existingPlugin = await this.prisma.plugin.findUnique({
      where: { name: createPluginDto.name },
    });

    if (existingPlugin) {
      throw new ConflictException('Plugin already exists');
    }

    const plugin = await this.prisma.plugin.create({
      data: {
        name: createPluginDto.name,
        displayName: createPluginDto.displayName,
        description: createPluginDto.description,
        version: createPluginDto.version,
        author: createPluginDto.author,
        repository: createPluginDto.repository,
        manifest: createPluginDto.manifest || {},
      },
    });

    return plugin;
  }

  async findAll() {
    return this.prisma.plugin.findMany({
      where: { enabled: true },
    });
  }

  async findOne(id: string) {
    const plugin = await this.prisma.plugin.findUnique({
      where: { id },
    });

    if (!plugin) {
      throw new NotFoundException('Plugin not found');
    }

    return plugin;
  }

  async install(tenantId: string, pluginId: string) {
    const existingInstallation = await this.prisma.tenantPlugin.findUnique({
      where: {
        tenantId_pluginId: {
          tenantId,
          pluginId,
        },
      },
    });

    if (existingInstallation) {
      throw new ConflictException('Plugin already installed for this tenant');
    }

    const installation = await this.prisma.tenantPlugin.create({
      data: {
        tenantId,
        pluginId,
        status: 'INSTALLED',
      },
    });

    return installation;
  }

  async activate(tenantId: string, pluginId: string) {
    const installation = await this.prisma.tenantPlugin.update({
      where: {
        tenantId_pluginId: {
          tenantId,
          pluginId,
        },
      },
      data: {
        status: 'ACTIVATED',
      },
    });

    return installation;
  }

  async deactivate(tenantId: string, pluginId: string) {
    const installation = await this.prisma.tenantPlugin.update({
      where: {
        tenantId_pluginId: {
          tenantId,
          pluginId,
        },
      },
      data: {
        status: 'DEACTIVATED',
      },
    });

    return installation;
  }

  async uninstall(tenantId: string, pluginId: string) {
    await this.prisma.tenantPlugin.delete({
      where: {
        tenantId_pluginId: {
          tenantId,
          pluginId,
        },
      },
    });

    return { message: 'Plugin uninstalled successfully' };
  }

  async getTenantPlugins(tenantId: string) {
    return this.prisma.tenantPlugin.findMany({
      where: { tenantId },
      include: {
        plugin: true,
      },
    });
  }
}
