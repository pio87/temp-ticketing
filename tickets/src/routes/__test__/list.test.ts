import request from 'supertest';
import { app } from '../../app';

const createTicket = async () => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({ title: 'title', price: 20 })
    .expect(201);
}

it('returns empty array if there are no tickets', async () => {
  const res = await request(app)
    .get(`/api/tickets`)
    .send()
    .expect(200);

  expect(res.body).toEqual([]);
});

it('returns the ticket if the ticket is found', async () => {
  await createTicket();
  await createTicket();
  await createTicket();

  const response = await request(app)
    .get(`/api/tickets`)
    .send()
    .expect(200);

  expect(response.body.length).toEqual(3);
})
