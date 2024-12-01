// src/__tests__/integration/mlPipeline.test.ts
describe('ML Pipeline Integration', () => {
    it('processes uploaded file through ML pipeline', async () => {
      const testAudio = Buffer.from('test audio data');
      const formData = new FormData();
      formData.append('file', new Blob([testAudio]), 'test.mp3');
  
      const response = await fetch('http://localhost:8000/process', {
        method: 'POST',
        body: formData
      });
  
      expect(response.ok).toBe(true);
    });
  });