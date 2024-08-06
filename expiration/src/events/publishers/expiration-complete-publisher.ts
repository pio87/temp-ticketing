import { ExpirationCompleteEvent, Publisher, Subjects } from '@pio87private/common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
    readonly subject = Subjects.ExpirationComplete;
}
