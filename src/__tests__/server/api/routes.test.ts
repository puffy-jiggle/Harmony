// src/__tests__/server/api/routes.test.ts
import express from 'express';
import request from 'supertest';
import apiRouter from '../../../server/routes/apiRouter';

// Mock middleware if needed
jest.mock('../../../server/controller/audioController', () => ({
  upload: (_req: express.Request, _res: express.Response, next: express.NextFunction) => next()
}));

describe('API Routes', () => {
  const app = express();
  let server: ReturnType<typeof app.listen>;

  beforeAll(() => {
    app.use('/api', apiRouter);
    server = app.listen();
  });

  afterAll((done) => {
    if (server) {
      server.close(done);
    } else {
      done();
    }
  });

  describe('GET routes', () => {
    it('/test endpoint works', async () => {
      const response = await request(app).get('/api/test');
      expect(response.status).toBe(200);
    });
  });
});