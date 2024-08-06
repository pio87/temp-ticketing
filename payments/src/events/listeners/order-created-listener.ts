import { Listener, OrderCreatedEvent, Subjects, TicketCreatedEvent } from '@pio87private/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queue-group-name';
import { Order } from '../../models/order';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated;
    queueGroupName = queueGroupName;

    async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
        const { id, ticket, userId, status, version } = data;

        const order = Order.build({
            id,
            userId,
            status,
            version,
            price: ticket.price
        });
        await order.save();

        msg.ack();
    }
}
