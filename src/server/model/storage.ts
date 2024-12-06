import { createClient } from '@supabase/supabase-js';
import { CustomError, AudioBucketName } from '../types';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_ANON_KEY || ''
);

const BUCKETS = ['original-audio', 'transformed-audio'] as const;

export const setupStorage = async () => {
  try {
    console.log('Starting storage setup...');
    
    for (const bucketName of BUCKETS) {
      console.log(`Checking bucket: ${bucketName}`);
      
      const { data: bucket, error: getBucketError } = await supabase
        .storage
        .getBucket(bucketName);

      if (getBucketError) {
        console.error(`Error checking bucket ${bucketName}:`, getBucketError);
        
        if (getBucketError.message?.includes('not found')) {
          console.log(`Bucket ${bucketName} not found, attempting to create...`);
          
          const { error: createError } = await supabase
            .storage
            .createBucket(bucketName, {
              public: false,
              fileSizeLimit: 52428800, // 50MB
            });

          if (createError) {
            console.error(`Failed to create bucket ${bucketName}:`, createError);
            throw createError;
          }
          console.log(`Successfully created bucket: ${bucketName}`);
        } else {
          throw getBucketError;
        }
      } else {
        console.log(`Bucket ${bucketName} already exists`);
      }
    }

    console.log('Storage setup completed successfully');
  } catch (error: any) {
    console.error('Storage setup error:', error);
    throw {
      log: `Storage Error: Storage setup failed - ${error.message}`,
      status: 500,
      message: { err: 'Storage setup failed' }
    } as CustomError;
  }
};

export const uploadAudio = async (
  file: Buffer,
  fileName: string,
  bucketName: AudioBucketName,
  userId: string
): Promise<string> => {
  try {
    const filePath = `${userId}/${Date.now()}_${fileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        contentType: 'audio/wav',
        upsert: false
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return data.publicUrl;

  } catch (error: any) {
    console.error('Upload error:', error);
    throw {
      log: `Storage Error: File upload failed - ${error.message}`,
      status: 500,
      message: { err: 'File upload failed' }
    } as CustomError;
  }
};

export const deleteAudio = async (
  filePath: string,
  bucketName: AudioBucketName
): Promise<void> => {
  try {
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);

    if (error) throw error;
  } catch (error: any) {
    console.error('Delete error:', error);
    throw {
      log: `Storage Error: File deletion failed - ${error.message}`,
      status: 500,
      message: { err: 'File deletion failed' }
    } as CustomError;
  }
};