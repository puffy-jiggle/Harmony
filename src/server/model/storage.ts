/**
 * Supabase Storage Implementation
 * 
 * Purpose:
 * - Manages audio file storage in Supabase
 * - Handles bucket creation and configuration
 * - Provides upload/delete operations
 * - Implements error handling and cleanup
 */

import { createClient } from '@supabase/supabase-js';
import { CustomError } from '../types';

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_ANON_KEY || ''
);

// Storage configuration constants
const STORAGE_CONFIG = {
  BUCKETS: ['original-audio', 'transformed-audio'] as const,
  MAX_FILE_SIZE: 52428800, // 50MB
  ALLOWED_MIME_TYPES: ['audio/wav', 'audio/mpeg']
};

type BucketName = typeof STORAGE_CONFIG.BUCKETS[number];

/**
 * Sets up storage buckets with proper configuration
 * @returns Promise<void>
 */
export const setupStorage = async (): Promise<void> => {
  try {
    for (const bucketName of STORAGE_CONFIG.BUCKETS) {
      const { data: existingBucket, error: getBucketError } = 
        await supabase.storage.getBucket(bucketName);

      if (getBucketError && getBucketError.message !== 'Bucket not found') {
        throw getBucketError;
      }

      if (!existingBucket) {
        const { error: createError } = await supabase.storage.createBucket(bucketName, {
          public: false,
          fileSizeLimit: STORAGE_CONFIG.MAX_FILE_SIZE,
        });

        if (createError) throw createError;
      }
    }
    console.log('Storage buckets setup complete');
  } catch (error) {
    throw createStorageError('Storage setup failed', error);
  }
};

/**
 * Uploads audio file to specified bucket
 * @param file - Audio file buffer
 * @param fileName - Name for stored file
 * @param bucketName - Target storage bucket
 * @param userId - User identifier for path creation
 * @returns Promise<string> - Public URL of uploaded file
 */
export const uploadAudio = async (
  file: Buffer,
  fileName: string,
  bucketName: BucketName,
  userId: string
): Promise<string> => {
  try {
    // Validate file size
    if (file.length > STORAGE_CONFIG.MAX_FILE_SIZE) {
      throw new Error(`File exceeds ${STORAGE_CONFIG.MAX_FILE_SIZE / 1048576}MB limit`);
    }

    const filePath = `${userId}/${Date.now()}_${fileName}`;
    
    // Upload file to Supabase
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        contentType: 'audio/wav',
        upsert: false
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return urlData.publicUrl;

  } catch (error) {
    throw createStorageError('File upload failed', error);
  }
};

/**
 * Deletes audio file from storage
 * @param filePath - Path to file in bucket
 * @param bucketName - Source storage bucket
 */
export const deleteAudio = async (
  filePath: string,
  bucketName: BucketName
): Promise<void> => {
  try {
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);

    if (error) throw error;
  } catch (error) {
    throw createStorageError('File deletion failed', error);
  }
};

/**
 * Creates standardized storage error
 * @param message - Error message
 * @param originalError - Original error object
 * @returns CustomError
 */
const createStorageError = (message: string, originalError: any): CustomError => ({
  log: `Storage Error: ${message} - ${originalError?.message || 'Unknown error'}`,
  status: 500,
  message: { err: message }
});

// Example usage:
/*
try {
  // Initialize storage
  await setupStorage();
  
  // Upload audio file
  const url = await uploadAudio(
    fileBuffer,
    'recording.wav',
    'original-audio',
    'user123'
  );
  
  // Delete if needed
  await deleteAudio('user123/recording.wav', 'original-audio');
} catch (error) {
  console.error('Storage operation failed:', error);
}
*/