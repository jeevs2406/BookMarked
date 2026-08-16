import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { bookRoutes } from './routes/book';
import { testDatabaseConnection } from './db/db.connect';

const app = Fastify({ logger: false });

async function start() {
  try {
    await app.register(cors, {
      origin: 'http://localhost:5173',
      methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    });

    app.register(bookRoutes);

    await testDatabaseConnection();

    await app.listen({ port: 3001 });

    console.log('Server running on port 3001');
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

start();