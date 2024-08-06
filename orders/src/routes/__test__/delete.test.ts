import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { Order } from '../../models/order';
import { OrderStatus } from '@pio87private/common';
import mongoose from 'mongoose';

it('accessed only for authenticated users', async () => {
  const response = await request(app)
    .delete('/api/orders/125')
    .send({
      ticketId: new mongoose.Types.ObjectId().toHexString()
    });

  expect(response.status).toEqual(401);
});

it('changes the status of order to canceled', async () => {
  const { userId, session } = global.signin();

  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'abc',
    price: 20
  });
  await ticket.save();

  const order = Order.build({
    ticket,
    userId,
    status: OrderStatus.Created,
    expiresAt: new Date()
  });
  await order.save();

  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', session)
    .send()
    .expect(200);

  const getOrderResponse = await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', session)
    .send();

  expect(getOrderResponse.status).toEqual(200);
  expect(getOrderResponse.body.id).toEqual(order.id);
  expect(getOrderResponse.body.status).toEqual(OrderStatus.Cancelled);
});
