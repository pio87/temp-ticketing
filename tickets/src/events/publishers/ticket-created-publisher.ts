import { Publisher, Subjects, TicketCreatedEvent } from '@pio87private/common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
    readonly subject = Subjects.TicketCreated;
}
