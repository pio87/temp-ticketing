import { natsWrapper } from '../../../nats-wrapper';
import { TicketUpdatedEvent } from '@pio87private/common';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../../models/ticket';
import { TicketUpdatedListener } from '../ticket-updated-listener';

const setup = ({ id, version }: { id: string, version: number }) => {
  const listener = new TicketUpdatedListener(natsWrapper.client);

  const data: TicketUpdatedEvent['data'] = {
    id,
    version: version,
    title: 'concert',
    price: 20,
    userId: new mongoose.Types.ObjectId().toHexString()
  };

  const msg: Message = {
    ack: jest.fn()
  } as unknown as Message;

  return { listener, data, msg };
};

it('updates the ticket if version number is correct', async () => {
  const newTicket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20,
  });
  await newTicket.save();

  const { listener, data, msg } = setup({ id: newTicket.id, version: 1 });

  await listener.onMessage(data, msg);

  const ticket = await Ticket.findById(data.id);

  expect(ticket).toBeDefined();
  expect(ticket!.version).toEqual(1);
  expect(msg.ack).toHaveBeenCalledTimes(1);
});


it('throws an error if ticket version is invalid', async () => {
  const newTicket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20,
  });

  const { listener, data, msg } = setup({ id: newTicket.id, version: 5 });

  try {
    await listener.onMessage(data, msg);
    throw new Error('Should not reach this point');
  } catch (e: any) {
    expect(e.message).toEqual('Ticket not found');
  }
  expect(msg.ack).not.toHaveBeenCalled();
});
