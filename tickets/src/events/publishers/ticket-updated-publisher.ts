import { Publisher, Subjects, TicketUpdatedEvent } from '@pio87private/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
    readonly subject = Subjects.TicketUpdated;
}
