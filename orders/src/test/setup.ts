import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

jest.mock('../nats-wrapper');

let mongo: any;

declare global {
  var signin: () => { userId: string, session: string };
}

beforeAll(async () => {
  process.env.JWT_KEY = 'abc123';

  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();

  await mongoose.connect(mongoUri, {});
});

beforeEach(async () => {
  jest.clearAllMocks();
  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  if (mongo) {
    await mongo.stop();
  }
  await mongoose.connection.close();
});

global.signin = () => {
  const userId = new mongoose.Types.ObjectId().toHexString();

  const payload = {
    id: userId,
    email: 'test@test.com'
  }

  const token = jwt.sign(payload, process.env.JWT_KEY!);

  const base64 = Buffer.from(JSON.stringify({ jwt: token })).toString('base64');

  return { userId, session: `session=${base64}`}
};
