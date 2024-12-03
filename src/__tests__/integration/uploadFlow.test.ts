// src/__tests__/integration/uploadFlow.test.ts
import request from 'supertest';
import express from 'express';
import apiRouter from '../../server/routes/apiRouter';
import { supabase } from '../../server/model/db';

describe('Upload Flow Integration', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use('/api', apiRouter);
  });

  it('completes full upload flow', async () => {
    const uploadResponse = await request(app)
      .post('/api/upload')
      .attach('file', Buffer.from('test audio'), 'test.mp3');
    
    expect(uploadResponse.status).toBe(200);
  });
});

// src/__tests__/integration/uploadFlow.test.ts