import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

export interface DomainEventPayload {
  type: string;
  aggregateId: string;
  tenantId?: string;
  payload: any;
  metadata?: Record<string, any>;
}

@Injectable()
export class EventsService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async publish(event: DomainEventPayload) {
    // Store event in database for event sourcing
    await this.prisma.domainEvent.create({
      data: {
        tenantId: event.tenantId,
        aggregateId: event.aggregateId,
        type: event.type,
        payload: event.payload,
        metadata: event.metadata || {},
        processed: false,
      },
    });

    // Emit event for real-time processing
    this.eventEmitter.emit(event.type, event);

    return { success: true, eventId: event.aggregateId };
  }

  async getEvents(tenantId: string, limit = 100) {
    return this.prisma.domainEvent.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getUnprocessedEvents() {
    return this.prisma.domainEvent.findMany({
      where: { processed: false },
      orderBy: { createdAt: 'asc' },
      take: 100,
    });
  }

  async markAsProcessed(eventId: string) {
    return this.prisma.domainEvent.update({
      where: { id: eventId },
      data: { processed: true },
    });
  }
}
