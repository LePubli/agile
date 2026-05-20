import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventsGateway } from './events.gateway';

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
    private eventsGateway: EventsGateway,
  ) {}

  async publish(event: DomainEventPayload) {
    // Store event in database for event sourcing
    const storedEvent = await this.prisma.domainEvent.create({
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

    // Broadcast to tenants via WebSocket
    if (event.tenantId) {
      this.eventsGateway.broadcastToTenant(event.tenantId, 'event', {
        type: event.type,
        payload: event.payload,
        timestamp: new Date().toISOString(),
      });
    }

    return { success: true, eventId: storedEvent.id };
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
