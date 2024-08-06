import express, { Request, Response } from 'express';
import { param } from 'express-validator';
import { NotAuthorizedError, NotFoundError, requireAuth } from '@pio87private/common';
import { Order } from '../models/order';

const router = express.Router();

router.get('/api/orders/:id',
  [param('id').isString().notEmpty()],
  requireAuth,
  async (req: Request, res: Response) => {
    const order = await Order.findById(req.params.id).populate('ticket');

    if (!order) {
      throw new NotFoundError();
    }

    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    res.status(200).send(order);
  }
);

export { router as showOrderRouter };
