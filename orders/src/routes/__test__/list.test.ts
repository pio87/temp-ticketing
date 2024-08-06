import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { Order } from '../../models/order';
import { OrderStatus } from '@pio87private/common';
import mongoose from 'mongoose';

it('has a route GET /api/orders', async () => {
  const response = await request(app)
    .get('/api/orders')
    .send();

  expect(response.status).not.toEqual(404);
});

it('accessed only for authenticated users', async () => {
  const response = await request(app)
    .get('/api/orders')
    .send();

  expect(response.status).toEqual(401);
});

it('does not return 401 for authorized users', async () => {
  const response = await request(app)
    .get('/api/orders')
    .set('Cookie', global.signin().session)
    .send();

  expect(response.status).toEqual(200);
});

it('return list of user orders along with tickets', async () => {
  const { userId, session } = global.signin();

  const ticketTitle = 'my ticket';

  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: ticketTitle,
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


  const ticket2 = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'another ticket',
    price: 20
  });
  await ticket2.save();

  const order2 = Order.build({
    ticket,
    userId: '123',
    status: OrderStatus.Created,
    expiresAt: new Date()
  });
  await order2.save();

  const response = await request(app)
    .get('/api/orders')
    .set('Cookie', session)
    .send();

  expect(response.status).toEqual(200);
  expect(response.body).toHaveLength(1);
  expect(response.body[0].ticket.title).toEqual(ticketTitle);
});

