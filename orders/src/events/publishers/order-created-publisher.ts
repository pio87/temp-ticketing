import { OrderCreatedEvent, Publisher, Subjects } from '@pio87private/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated;
}
