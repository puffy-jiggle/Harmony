// src/__tests__/db/queries.test.ts
import { supabase } from '../../server/model/db';

describe('Database Queries', () => {
  it('can insert and retrieve audio file records', async () => {
    const testData = {
      filename: 'test.mp3',
      user_id: 'test-user',
      status: 'uploaded'
    };

    const { data, error } = await supabase
      .from('audio_files')
      .insert(testData)
      .select();

    expect(error).toBeNull();
    expect(data).toBeDefined();
  });
});