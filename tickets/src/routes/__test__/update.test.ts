import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';

const ticketParams = {
  title: 'title',
  price: 20
};

it('401 for not authorized users', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .send(ticketParams)
    .expect(401);
});

it('401 if user does not own the ticket', async () => {
  const res = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send(ticketParams)
    .expect(201);


  await request(app)
    .put(`/api/tickets/${res.body.id}`)
    .set('Cookie', global.signin())
    .send(ticketParams)
    .expect(401);
});

it('returns 404 if ticket is not found', async () => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send(ticketParams)
    .expect(201);

  const id = new mongoose.Types.ObjectId().toHexString();

  await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', global.signin())
    .send(ticketParams)
    .expect(404);
});

it('updates the ticket with valid parameters', async () => {
  const updatedTicketParams = {
    title: 'new title',
    price: 25
  };

  const session = global.signin();

  const createdTicket = await request(app)
    .post('/api/tickets')
    .set('Cookie', session)
    .send(ticketParams)
    .expect(201);

  const response = await request(app)
    .put(`/api/tickets/${createdTicket.body.id}`)
    .set('Cookie', session)
    .send(updatedTicketParams)
    .expect(200);

  expect(response.body.title).toEqual(updatedTicketParams.title);
  expect(response.body.price).toEqual(updatedTicketParams.price);
});

it('returns 400 if title is invalid', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();

  await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', global.signin())
    .send({
      title: '',
      price: 20
    })
    .expect(400);

  await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', global.signin())
    .send({
      price: 20
    })
    .expect(400);
});

it('returns 400 if price is invalid', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();

  await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', global.signin())
    .send({
      title: 'valid tile',
      price: -4
    })
    .expect(400);

  await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', global.signin())
    .send({
      title: 'valid tile',
    })
    .expect(400);
});
