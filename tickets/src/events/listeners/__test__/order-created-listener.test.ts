import { OrderCreatedEvent, OrderStatus } from '@pio87private/common';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../../models/ticket';
import { OrderCreatedListener } from '../order-created-listener';
import { natsWrapper } from '../../../nats-wrapper';

const setup = ({ id, version }: { id: string, version: number }) => {
  const listener = new OrderCreatedListener(natsWrapper.client);

  const data: OrderCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: version,
    userId: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    expiresAt: new Date().toISOString(),
    ticket: {
      id,
      price: 10
    }
  };

  const msg: Message = {
    ack: jest.fn()
  } as unknown as Message;

  return { listener, data, msg };
};

it('sets orderId on given ticket', async () => {
  const newTicket = Ticket.build({
    title: 'concert',
    price: 20,
    userId: new mongoose.Types.ObjectId().toHexString(),
  });
  await newTicket.save();

  const { listener, data, msg } = setup({ id: newTicket.id, version: 1 });

  await listener.onMessage(data, msg);

  const ticket = await Ticket.findById(data.ticket.id);

  expect(ticket).toBeDefined();
  expect(ticket!.version).toEqual(1);
  expect(ticket!.orderId).toEqual(data.id);
  expect(msg.ack).toHaveBeenCalledTimes(1);
});

