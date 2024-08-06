import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';

it('has a route POST /api/tickets' , async () => {
  const response = await request(app)
    .post('/api/tickets')
    .send({});

  expect(response.status).not.toEqual(404)
});

it('accessed only for authenticated users' , async () => {
  const response = await request(app)
    .post('/api/tickets')
    .send({
      title: 'title',
      price: '20'
    });

  expect(response.status).toEqual(401)
});

it('does not return 401 for authorized users' , async () => {
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title: 'title',
      price: '20'
    });

  expect(response.status).not.toEqual(401)
});

it('returns error if invalid title is provided' , async () => {
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title: 23,
      price: '20'
    });

  expect(response.status).toEqual(400)
});

it('returns error if invalid price is provided' , async () => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title: 'valid title',
      price: -10
    })
    .expect(400);

  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title: 'valid title',
    })
    .expect(400);
});

it('creates a ticket if all params are valid' , async () => {
  const tickets = await Ticket.find({});
  expect(tickets.length).toEqual(0);

  const title =  'valid title';

  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title,
      price: 20
    })
    .expect(201);

  const ticketsAfter = await Ticket.find({});
  expect(ticketsAfter.length).toEqual(1);
  expect(ticketsAfter[0].title).toEqual(title);
});
