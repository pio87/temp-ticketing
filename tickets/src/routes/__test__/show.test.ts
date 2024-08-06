import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';

const ticketParams = {
  title: 'title',
  price: 20
};

it('returns 404 if ticket is not found', async () => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send(ticketParams)
    .expect(201);

  const id = new mongoose.Types.ObjectId().toHexString();

  await request(app)
    .get(`/api/tickets/${id}`)
    .send()
    .expect(404);
});

it('returns the ticket if the ticket is found', async () => {
  const createdTicket = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send(ticketParams)
    .expect(201);

  const response = await request(app)
    .get(`/api/tickets/${createdTicket.body.id}`)
    .send()
    .expect(200);

  expect(response.body.title).toEqual(ticketParams.title);
  expect(response.body.price).toEqual(ticketParams.price);
})
