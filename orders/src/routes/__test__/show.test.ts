import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { Order } from '../../models/order';
import { OrderStatus } from '@pio87private/common';
import mongoose from 'mongoose';

it('accessed only for authenticated users', async () => {
  const response = await request(app)
    .get('/api/orders/125')
    .send();

  expect(response.status).toEqual(401);
});

it('returns user order', async () => {
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


  const response = await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', session)
    .send();

  expect(response.status).toEqual(200);
  expect(response.body.id).toEqual(order.id);
});

it('does not return an order if it does not belong to the user', async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'abc',
    price: 20
  });
  await ticket.save();

  const order = Order.build({
    ticket,
    userId: '123',
    status: OrderStatus.Created,
    expiresAt: new Date()
  });
  await order.save();


  const response = await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', global.signin().session)
    .send();

  expect(response.status).toEqual(401);
});
