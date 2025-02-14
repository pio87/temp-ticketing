import express, { Request, Response } from 'express';
import { BadRequestError, NotAuthorizedError, NotFoundError, requireAuth, validateRequest } from '@pio87private/common';
import { body } from 'express-validator';
import { Ticket } from '../models/ticket';
import { TicketUpdatedPublisher } from '../events/publishers/ticket-updated-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.put('/api/tickets/:id',
  requireAuth,
  [
    body('title')
      .isString()
      .trim()
      .notEmpty()
      .withMessage('Invalid title'),
    body('price')
      .isFloat({ gt: 0 })
      .withMessage('Invalid price')
  ],
  validateRequest,
  async (req: Request, res: Response) => {

    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      throw new NotFoundError();
    }

    if (ticket.orderId) {
      throw new BadRequestError('Cannot edit a reserved ticket');
    }


    if (ticket.get('userId') !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    ticket.set({
      title: req.body.title,
      price: req.body.price
    });

    await ticket.save();

    await new TicketUpdatedPublisher(natsWrapper.client).publish({
      id: ticket.id,
      version: ticket.version,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      orderId: ticket.orderId
    });

    res.status(200).send(ticket);
  }
);

export { router as updateTicketRouter };
