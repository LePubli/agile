import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTenantDto, UpdateTenantDto } from './dto/tenant.dto';

@Injectable()
export class TenantsService {
  constructor(private prisma: PrismaService) {}

  async create(createTenantDto: CreateTenantDto, userId: string) {
    const existingTenant = await this.prisma.tenant.findUnique({
      where: { slug: createTenantDto.slug },
    });

    if (existingTenant) {
      throw new ConflictException('Tenant slug already exists');
    }

    const tenant = await this.prisma.tenant.create({
      data: {
        name: createTenantDto.name,
        slug: createTenantDto.slug,
        plan: createTenantDto.plan || 'FREE',
      },
    });

    // Add user as owner
    await this.prisma.userTenant.create({
      data: {
        userId,
        tenantId: tenant.id,
        role: 'OWNER',
      },
    });

    return tenant;
  }

  async findAll(userId: string) {
    const userTenants = await this.prisma.userTenant.findMany({
      where: { userId },
      include: {
        tenant: true,
      },
    });

    return userTenants.map((ut) => ({
      ...ut.tenant,
      role: ut.role,
    }));
  }

  async findOne(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      include: {
        users: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        plugins: {
          include: {
            plugin: true,
          },
        },
      },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return tenant;
  }

  async update(id: string, updateTenantDto: UpdateTenantDto) {
    const tenant = await this.prisma.tenant.update({
      where: { id },
      data: updateTenantDto,
    });

    return tenant;
  }

  async remove(id: string) {
    await this.prisma.tenant.delete({
      where: { id },
    });

    return { message: 'Tenant deleted successfully' };
  }

  async addUserToTenant(tenantId: string, userId: string, role: string) {
    const userTenant = await this.prisma.userTenant.create({
      data: {
        tenantId,
        userId,
        role: role as any,
      },
    });

    return userTenant;
  }

  async removeUserFromTenant(tenantId: string, userId: string) {
    await this.prisma.userTenant.delete({
      where: {
        userId_tenantId: {
          userId,
          tenantId,
        },
      },
    });

    return { message: 'User removed from tenant' };
  }
}
