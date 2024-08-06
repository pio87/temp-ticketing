import { OrderCancelledEvent, Publisher, Subjects } from '@pio87private/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
    readonly subject = Subjects.OrderCancelled;
}
