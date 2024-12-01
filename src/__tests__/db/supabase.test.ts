// src/__tests__/db/supabase.test.ts
import { supabase } from '../../server/model/db';

describe('Supabase Connection', () => {
  it('can connect to Supabase', async () => {
    const { data, error } = await supabase.from('your_table').select('*').limit(1);
    expect(error).toBeNull();
  });
});