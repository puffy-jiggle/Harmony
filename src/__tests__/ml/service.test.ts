// src/__tests__/ml/service.test.ts
describe('ML Service', () => {
    const ML_SERVICE_URL = 'http://localhost:8000';
  
    it('health check endpoint is accessible', async () => {
      const response = await fetch(`${ML_SERVICE_URL}/health`);
      expect(response.ok).toBe(true);
    });
  });