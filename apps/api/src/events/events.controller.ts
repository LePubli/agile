import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { EventsService, DomainEventPayload } from './events.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('events')
@UseGuards(JwtAuthGuard)
export class EventsController {
  constructor(private eventsService: EventsService) {}

  @Post()
  async publish(@Body() event: DomainEventPayload, @Request() req) {
    return this.eventsService.publish({
      ...event,
      tenantId: req.user.tenantId,
    });
  }

  @Get()
  async getEvents(@Request() req) {
    return this.eventsService.getEvents(req.user.tenantId);
  }

  @Get('unprocessed')
  async getUnprocessedEvents() {
    return this.eventsService.getUnprocessedEvents();
  }

  @Post(':id/process')
  async markAsProcessed(@Param('id') id: string) {
    return this.eventsService.markAsProcessed(id);
  }
}
