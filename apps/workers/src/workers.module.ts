import { Module } from '@nestjs/common'
import { BullModule } from '@nestjs/bullmq'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { EmailsProcessor } from './processors/emails.processor'
import { AiTasksProcessor } from './processors/ai-tasks.processor'
import { WorkflowsProcessor } from './processors/workflows.processor'
import { EnrichmentProcessor } from './processors/enrichment.processor'
import { ScrapingProcessor } from './processors/scraping.processor'

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        connection: {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6379),
          password: configService.get('REDIS_PASSWORD'),
        },
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
          removeOnComplete: {
            count: 1000,
          },
          removeOnFail: {
            count: 5000,
          },
        },
      }),
      inject: [ConfigService],
    }),
    // Emails Queue
    BullModule.registerQueue({
      name: 'emails',
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      },
    }),
    // AI Tasks Queue
    BullModule.registerQueue({
      name: 'ai-tasks',
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    }),
    // Workflows Queue
    BullModule.registerQueue({
      name: 'workflows',
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      },
    }),
    // Enrichment Queue
    BullModule.registerQueue({
      name: 'enrichment',
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1500,
        },
      },
    }),
    // Scraping Queue
    BullModule.registerQueue({
      name: 'scraping',
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 3000,
        },
      },
    }),
  ],
  providers: [
    EmailsProcessor,
    AiTasksProcessor,
    WorkflowsProcessor,
    EnrichmentProcessor,
    ScrapingProcessor,
  ],
})
export class WorkersModule {}
