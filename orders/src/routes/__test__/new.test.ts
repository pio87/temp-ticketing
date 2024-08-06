import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { Ticket } from '../../models/ticket';
import { Order } from '../../models/order';
import { OrderStatus } from '@pio87private/common';

it('has a route POST /api/orders' , async () => {
  const response = await request(app)
    .post('/api/orders')
    .send({});

  expect(response.status).not.toEqual(404)
});

it('accessed only for authenticated users' , async () => {
  const response = await request(app)
    .post('/api/orders')
    .send({
      ticketId: new mongoose.Types.ObjectId().toHexString(),
    });

  expect(response.status).toEqual(401)
});

it('does not return 401 for authorized users' , async () => {
  const response = await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin().session)
    .send({
      ticketId: new mongoose.Types.ObjectId().toHexString(),
    });

  expect(response.status).not.toEqual(401)
});

it('returns not found error if invalid ticketId is provided' , async () => {
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin().session)
    .send({
      ticketId: 'abc',
    });

  expect(response.status).toEqual(404)
});

it('returns error if ticket is already reserved' , async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'title',
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
    .post('/api/orders')
    .set('Cookie', global.signin().session)
    .send({
      ticketId: ticket.id
    });

  expect(response.body.errors[0].message).toEqual('Ticket is already reserved');
  expect(response.status).toEqual(400);
});

it('creates an order if all params are valid' , async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'title',
    price: 20
  });
  await ticket.save();

  const response = await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin().session)
    .send({
      ticketId: ticket.id
    });

  expect(response.status).toEqual(201);
});
