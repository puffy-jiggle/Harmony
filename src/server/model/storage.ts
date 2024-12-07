import { createClient } from '@supabase/supabase-js';
import { CustomError, AudioUpload, AudioBucketName } from '../types';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_ANON_KEY || ''
);

const BUCKETS: AudioBucketName[] = ['original-audio', 'transformed-audio'];

export const setupStorage = async () => {
  try {
    console.log('Starting storage setup...');
    
    for (const bucketName of BUCKETS) {
      console.log(`Checking bucket: ${bucketName}`);
      
      const { data: bucket, error: getBucketError } = await supabase
        .storage
        .getBucket(bucketName);

      if (getBucketError) {
        if (getBucketError.message?.includes('not found')) {
          console.log(`Creating bucket: ${bucketName}`);
          const { error: createError } = await supabase.storage
            .createBucket(bucketName, {
              public: false,
              fileSizeLimit: 52428800, // 50MB
            });

          if (createError) throw createError;
          console.log(`Created bucket: ${bucketName}`);
        } else {
          throw getBucketError;
        }
      } else {
        console.log(`Bucket ${bucketName} already exists`);
      }
    }
  } catch (error: any) {
    console.error('Storage setup error:', error);
    throw {
      log: `Storage Error: ${error.message}`,
      status: 500,
      message: { err: 'Storage setup failed' }
    } as CustomError;
  }
};

export const uploadAudio = async (
  { fileContent, fileName, contentType, userId, bucketName }: AudioUpload
): Promise<string> => {
  try {
    const filePath = `${userId}/${Date.now()}_${fileName}`;
    
    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, fileContent, { 
        contentType,
        upsert: true 
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return data.publicUrl;

  } catch (error: any) {
    console.error('Upload error:', error);
    throw {
      log: `Storage Error: ${error.message}`,
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
      log: `Storage Error: ${error.message}`,
      status: 500,
      message: { err: 'File deletion failed' }
    } as CustomError;
  }
};

export const generateSignedUrl = async (bucketName: string, filePath: string): Promise<string> => {
    const { data, error } = await supabase
      .storage
      .from(bucketName)
      .createSignedUrl(filePath, 60 * 10); // 10 minutes expiration
  
    if (error) {
      console.error('Error generating signed URL:', error);
      throw new Error('Failed to generate signed URL');
    }
  
    return data.signedUrl;
  };
  