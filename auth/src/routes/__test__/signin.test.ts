import request from 'supertest';
import { app } from '../../app';

it('returns 400 when using an email that does not exist', async () => {
  await request(app)
    .post('/api/users/signin')
    .send({
      email: 'i_do_not_exist@test.com',
      password: 'password'
    })
    .expect(400)
    .expect('Content-Type', /json/)
    .expect((res) => {
      expect(res.body.errors.length).toEqual(1);
      expect(res.body.errors[0].message).toEqual('Invalid credentials');
    });
});

it('fails when incorrect password is used', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'i_do_exist@test.com',
      password: 'password'
    })
    .expect(201);

  const res = await request(app)
    .post('/api/users/signin')
    .send({
      email: 'i_do_exist@test.com',
      password: 'password'
    })
    .expect(200);

  expect(res.get('Set-Cookie')).toBeDefined();
  expect(res.body.email).toEqual('i_do_exist@test.com');
  expect(res.body.id).toBeDefined();
  expect(res.body.password).toBeUndefined();
});
