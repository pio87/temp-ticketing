import express, { Request, Response } from 'express';
import {
  BadRequestError,
  NotAuthorizedError,
  NotFoundError,
  OrderStatus,
  requireAuth,
  validateRequest
} from '@pio87private/common';
import { body } from 'express-validator';
import { Order } from '../models/order';
import { stripe } from '../stripe';
import { Payment } from '../models/payment';
import { PaymentCreatedPublisher } from '../events/publishers/payment-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.post('/api/payments',
  requireAuth,
  [
    body('orderId')
      .isString()
      .trim()
      .notEmpty()
      .withMessage('Invalid order ID'),
    body('token')
      .isString()
      .trim()
      .notEmpty()
      .withMessage('Invalid token')
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const order = await Order.findById(req.body.orderId);
    if (!order) {
      throw new NotFoundError();
    }
    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    if (order.status === OrderStatus.Cancelled) {
      throw new BadRequestError('Order is cancelled');
    }


    const stripeResponse = await stripe.charges.create({
      amount: order.price * 100,
      currency: 'pln',
      source: req.body.token
    });

    order.set({
      status: OrderStatus.Complete
    });
    await order.save();

    const payment = Payment.build({
      orderId: order.id,
      stripeId: stripeResponse.id
    });
    await payment.save();

    await new PaymentCreatedPublisher(natsWrapper.client).publish({
      id: payment.id,
      orderId: payment.orderId,
      stripeId: payment.stripeId
    });

    res.status(201).send(order);
  }
);

export { router as createChargeRouter };
