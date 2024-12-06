import { Request, Response, NextFunction } from "express";
import { supabase } from '../model/db'
import pool from "../model/db";
import fetch from 'node-fetch';
import * as fs from 'fs';
import path from 'path';

const audioMiddleware = {
  // Test function for route verification
  testFunction: async (req: Request, res: Response, next: NextFunction) => {
    console.log('testFunction is hit in audioMiddleware');
    console.log('request headers', req.headers);
    setTimeout(()=>{console.log('request body', req.body);}, 1000);
    return next();
  },

  // Original upload function for testing
  uploadAudioToSupabase: async (req: Request, res: Response, next: NextFunction) => {
    const fileName = 'test_audio.mp3'
    const bucketName = 'audioStorage';
    const user_id = 'ce2639c3-4a75-44d2-b11b-c0f87d544873'
    const filePath = path.resolve(__dirname, '../../assets/transformed.wav');

    try {
      const fileContent = fs.readFileSync(filePath);
      console.log('file content', fileContent);

      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, fileContent, { contentType: 'audio/mpeg', upsert: true });
  
      if (uploadError) {
        throw new Error(`Error uploading file to storage: ${uploadError.message}`);
      }
  
      const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(fileName);
      const publicUrl = publicUrlData.publicUrl;
  
      if (!publicUrl) {
        throw new Error('Error retrieving public URL of the file');
      }
  
      console.log(`File uploaded successfully. Public URL: ${publicUrl}`);
  
      const client = await pool.connect();
      try {
        const result = await client.query(
          `INSERT INTO audio (user_id, "audioURL") VALUES ($1, $2) RETURNING *`,
          [user_id, publicUrl]
        );
        console.log(`Audio URL saved to database:`, result.rows[0]);
      } finally {
        client.release();
      }

      return next();
    } catch (err) {
      console.error('Error:', err);
      // @ts-ignore
      next(err);
    }
  },

  // Save audio pair function for storing original and transformed audio
  saveAudioPair: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { originalUrl, transformedUrl } = req.body;
      if (!originalUrl || !transformedUrl) {
        // @ts-ignore
        return next(new Error('Missing audio URLs'));
      }
      
      if (!req.user) {
        // @ts-ignore
        return next(new Error('User not authenticated'));
      }
      const userId = req.user.id;

      try {
        // Step 1: Convert blob URLs to actual blobs
        const [originalBlob, transformedBlob] = await Promise.all([
          fetch(originalUrl).then(r => r.blob()),
          fetch(transformedUrl).then(r => r.blob())
        ]);

        // Generate unique filenames
        const timestamp = Date.now();
        const originalFileName = `${userId}/original_${timestamp}.wav`;
        const transformedFileName = `${userId}/transformed_${timestamp}.wav`;

        // Step 2: Upload both files to Supabase storage
        const uploadPromises = await Promise.all([
          supabase.storage
            .from('audioStorage')
            .upload(originalFileName, originalBlob, { 
              contentType: 'audio/wav',
              upsert: true 
            }),
          supabase.storage
            .from('audioStorage')
            .upload(transformedFileName, transformedBlob, { 
              contentType: 'audio/wav',
              upsert: true 
            })
        ]);

        // Check for upload errors
        const [originalUpload, transformedUpload] = uploadPromises;
        if (originalUpload.error) throw new Error(`Original upload failed: ${originalUpload.error.message}`);
        if (transformedUpload.error) throw new Error(`Transformed upload failed: ${transformedUpload.error.message}`);

        // Step 3: Get public URLs
        const originalUrlData = supabase.storage
          .from('audioStorage')
          .getPublicUrl(originalFileName);
        const transformedUrlData = supabase.storage
          .from('audioStorage')
          .getPublicUrl(transformedFileName);

        // Step 4: Save to database
        const client = await pool.connect();
        try {
          await client.query('BEGIN');

          const originalResult = await client.query(
            `INSERT INTO audio (user_id, "audioURL", file_type, is_saved)
             VALUES ($1, $2, 'original', true)
             RETURNING id`,
            [userId, originalUrlData.data.publicUrl]
          );

          await client.query(
            `INSERT INTO audio (user_id, "audioURL", file_type, is_saved, pair_id)
             VALUES ($1, $2, 'transformed', true, $3)`,
            [userId, transformedUrlData.data.publicUrl, originalResult.rows[0].id]
          );

          await client.query('COMMIT');
          
          res.locals.audioSave = {
            success: true,
            originalId: originalResult.rows[0].id,
            urls: {
              original: originalUrlData.data.publicUrl,
              transformed: transformedUrlData.data.publicUrl
            }
          };
          
          // @ts-ignore
          next();

        } catch (err) {
          await client.query('ROLLBACK');
          throw err;
        } finally {
          client.release();
        }

      } catch (err) {
        throw new Error(`Failed to handle file uploads: ${err}`);
      }

    } catch (err) {
      console.error('Error in saveAudioPair:', err);
      // @ts-ignore
      next(err);
    }
  },

  // Get user's audio files
  getUserAudio: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { user_id } = req.params;
      if (!user_id) {
        return res.status(400).json({ error: 'Missing user_id parameter' });
      }

      const client = await pool.connect();
      try {
        const result = await client.query(
          `SELECT * FROM audio WHERE user_id = $1 ORDER BY created_at DESC`,
          [user_id]
        );

        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'No audio files found' });
        }

        return res.status(200).json({ audioFiles: result.rows });
      } finally {
        client.release();
      }
    } catch (err) {
      console.error('Error retrieving user audio:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
};

export default audioMiddleware;