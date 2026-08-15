import Fastify from 'fastify';
import cors from '@fastify/cors';
import { bookRoutes } from './routes/book';

import 'dotenv/config';

const app = Fastify({ logger: false });

app.register(cors, {
  origin: 'http://localhost:5173', // your Vite dev server's origin
});

app.register(bookRoutes);

app.listen({ port: 3001 }, (err) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
});