import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create roles
  const roles = ['owner', 'admin', 'member', 'viewer'];
  for (const roleName of roles) {
    await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: {
        name: roleName,
        description: `${roleName} role`,
        permissions: [],
      },
    });
  }
  console.log('✅ Roles created');

  // Create default tenant
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'default' },
    update: {},
    create: {
      name: 'Default Workspace',
      slug: 'default',
      status: 'ACTIVE',
    },
  });
  console.log('✅ Default tenant created');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@nexusos.com' },
    update: {},
    create: {
      email: 'admin@nexusos.com',
      firstName: 'Admin',
      lastName: 'User',
      passwordHash: hashedPassword,
      status: 'ACTIVE',
      emailVerified: true,
    },
  });
  console.log('✅ Admin user created');

  // Add admin to tenant as owner
  const ownerRole = await prisma.role.findUnique({
    where: { name: 'owner' },
  });

  await prisma.tenantMember.upsert({
    where: {
      userId_tenantId: {
        userId: adminUser.id,
        tenantId: tenant.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      tenantId: tenant.id,
      roleId: ownerRole?.id || '',
    },
  });
  console.log('✅ Admin added to tenant');

  // Create sample plugin
  await prisma.plugin.upsert({
    where: { slug: 'analytics' },
    update: {},
    create: {
      slug: 'analytics',
      name: 'Analytics Pro',
      version: '1.0.0',
      description: 'Advanced analytics and reporting',
      author: 'NexusOS Team',
      status: 'AVAILABLE',
      metadata: {
        category: 'analytics',
        featured: true,
      },
    },
  });
  console.log('✅ Sample plugin created');

  // Create sample AI provider
  await prisma.aiProvider.upsert({
    where: { name: 'openai' },
    update: {},
    create: {
      name: 'openai',
      displayName: 'OpenAI',
      baseUrl: 'https://api.openai.com/v1',
      status: 'ACTIVE',
      config: {
        models: ['gpt-4', 'gpt-3.5-turbo'],
      },
    },
  });
  console.log('✅ AI Provider created');

  // Create sample event types
  const eventTypes = [
    { name: 'user.created', description: 'User account created' },
    { name: 'user.login', description: 'User logged in' },
    { name: 'workflow.executed', description: 'Workflow executed' },
    { name: 'plugin.installed', description: 'Plugin installed' },
  ];

  for (const eventType of eventTypes) {
    await prisma.eventType.upsert({
      where: { name: eventType.name },
      update: {},
      create: {
        name: eventType.name,
        description: eventType.description,
        schema: {},
      },
    });
  }
  console.log('✅ Event types created');

  // Create sample workflow
  const ownerMember = await prisma.tenantMember.findFirst({
    where: { userId: adminUser.id, tenantId: tenant.id },
  });

  if (ownerMember) {
    await prisma.workflow.create({
      data: {
        tenantId: tenant.id,
        creatorId: adminUser.id,
        name: 'Welcome Email Workflow',
        description: 'Send welcome email to new users',
        status: 'DRAFT',
        trigger: {
          type: 'event',
          event: 'user.created',
        },
        steps: [
          {
            id: 'step-1',
            type: 'action',
            action: 'send_email',
            config: {
              template: 'welcome',
              to: '{{user.email}}',
            },
          },
        ],
      },
    });
    console.log('✅ Sample workflow created');
  }

  console.log('🎉 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
