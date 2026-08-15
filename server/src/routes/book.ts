import { FastifyInstance } from 'fastify';
import { searchBooks } from '../services/bookSearch';

export async function bookRoutes(app: FastifyInstance) {
  app.get('/api/books/search', async (req, reply) => {
    const { q } = req.query as { q?: string };
    if (!q) return reply.status(400).send({ error: 'Missing search query' });

    const results = await searchBooks(q);
    return results;
  });
}