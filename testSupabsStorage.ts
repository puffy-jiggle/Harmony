import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient('SUPABASE_URL', 'SUPABASE_ANON_KEY');

async function testUpload() {
  const bucket = 'original-audio'; // Change this to the desired bucket
  const filePath = 'test-file.txt'; // Name of the file in the bucket
  const content = Buffer.from('Test file content'); // File content as a buffer

  try {
    // Upload file to Supabase
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, content);

    if (error) {
      console.error('Upload error:', error);
    } else {
      console.log('Upload success:', data);
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

testUpload();
