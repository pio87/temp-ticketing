import express from 'express';
import 'express-async-errors';
import cookieSession from 'cookie-session';
import { json } from 'body-parser';
import { currentUser, errorHandler, NotFoundError } from '@pio87private/common';
import { createTicketRouter } from './routes/new';
import { showTicketRouter } from './routes/show';
import { listTicketsRouter } from './routes/list';
import { updateTicketRouter } from './routes/update';

const app = express();

app.set('trust proxy', true);
app.use(json());
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test',
  })
);

app.use(currentUser);

app.use(createTicketRouter);
app.use(showTicketRouter);
app.use(listTicketsRouter);
app.use(updateTicketRouter);

app.all('*', async () => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
