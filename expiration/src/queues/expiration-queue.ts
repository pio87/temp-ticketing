import Queue from 'bull';
import { ExpirationCompletePublisher } from '../events/publishers/expiration-complete-publisher';
import { natsWrapper } from '../nats-wrapper';

export interface ExpirationCompleteData {
  orderId: string;
}

const expirationQueue = new Queue<ExpirationCompleteData>('order:expiration', {
  redis: {
    host: process.env.REDIS_HOST!
  }
});

expirationQueue.process(async job => {
  await new ExpirationCompletePublisher(natsWrapper.client).publish({
    orderId: job.data.orderId
  });
});

export { expirationQueue };
