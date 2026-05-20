import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { TenantsModule } from './tenants/tenants.module';
import { PluginsModule } from './plugins/plugins.module';
import { EventsModule } from './events/events.module';
import { WorkflowsModule } from './workflows/workflows.module';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    JwtModule.register({}),
    PrismaModule,
    AuthModule,
    TenantsModule,
    PluginsModule,
    EventsModule,
    WorkflowsModule,
    AiModule,
  ],
})
export class AppModule {}
