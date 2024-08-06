import { PaymentCreatedEvent, Publisher, Subjects } from '@pio87private/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
}
