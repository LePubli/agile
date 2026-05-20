import { NestFactory } from '@nestjs/core'
import { ConfigService } from '@nestjs/config'
import { Logger, ValidationPipe } from '@nestjs/common'
import { WorkersModule } from './workers.module'

async function bootstrap() {
  const logger = new Logger('WorkersBootstrap')
  
  try {
    const app = await NestFactory.createApplicationContext(WorkersModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    })

    const configService = app.get(ConfigService)
    const port = configService.get('WORKERS_PORT', 3002)

    logger.log(`🚀 Workers service started on port ${port}`)
    logger.log(`📦 Processing queues: emails, ai-tasks, workflows, enrichment, scraping`)
    
    // Graceful shutdown
    const shutdown = async (signal: string) => {
      logger.log(`Received ${signal}, shutting down gracefully...`)
      await app.close()
      process.exit(0)
    }

    process.on('SIGTERM', () => shutdown('SIGTERM'))
    process.on('SIGINT', () => shutdown('SIGINT'))

  } catch (error) {
    logger.error(`Failed to start workers: ${error.message}`)
    process.exit(1)
  }
}

bootstrap()
