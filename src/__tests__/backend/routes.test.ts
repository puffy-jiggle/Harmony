// src/__tests__/backend/routes.test.ts
import request from 'supertest';
import express from 'express';
import apiRouter from '../../server/routes/apiRouter';

describe('API Routes', () => {
  const app = express();
  app.use('/api', apiRouter);

  it('GET /api/test returns 200', async () => {
    const response = await request(app).get('/api/test');
    expect(response.status).toBe(200);
  });
});

// src/__tests__/backend/routes.test.ts