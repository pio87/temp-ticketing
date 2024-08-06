import express, { Request, Response } from 'express';
import { Ticket } from '../models/ticket';
import { param } from 'express-validator';
import { NotFoundError } from '@pio87private/common';

const router = express.Router();

router.get('/api/tickets/:id',
  [
    param('id').isString().isLength({ min: 24, max: 24 }).notEmpty()
  ],
  async (req: Request, res: Response) => {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      throw new NotFoundError();
    }

    res.status(200).send(ticket);
  }
);

export { router as showTicketRouter };
