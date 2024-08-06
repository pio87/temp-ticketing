import request from 'supertest';
import { app } from '../../app';

it('signs out successfully', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'i_do_exist@test.com',
      password: 'password'
    })
    .expect(201);

  const res = await request(app)
    .post('/api/users/signout')
    .send({})
    .expect(200);

  expect(res.get('Set-Cookie')?.[0]).toContain('session=;')
});
