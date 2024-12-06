/**
 * Audio Controller
 * 
 * Handles:
 * - Audio file upload and storage
 * - ML service integration
 * - File transformation and persistence
 * - Error handling and cleanup`
 * 
 * Flow:
 * 1. Receive audio upload
 * 2. Store original in Supabase
 * 3. Send to ML service
 * 4. Store transformed result
 * 5. Return URLs to client
 */

import { Request, Response, NextFunction } from 'express';
import { uploadAudio, deleteAudio } from '../model/storage';
import * as fs from 'node:fs/promises';
import { CustomError } from '../types';
import pool from '../model/db';

const audioController = {
  // Process audio upload and transformation
  upload: async (req: Request, res: Response, next: NextFunction) => {
    // Validation checks
    if (!req.file) {
      return next(createError('No file uploaded', 400));
    }
    if (!req.user) {
      return next(createError('Not authenticated', 401));
    }

    const tempFilePath = req.file.path;
    let originalUrl: string | null = null;
    let transformedUrl: string | null = null;

    try {
      // Read uploaded file
      const fileBuffer = await fs.readFile(tempFilePath);
      
      // Upload original to storage
      originalUrl = await uploadAudio(
        fileBuffer,
        req.file.originalname,
        'original-audio',
        req.user.id.toString()
      );

      // Prepare for ML service
      const formData = new FormData();
      formData.append('audio_file', new Blob([fileBuffer], { type: 'audio/wav' }));

      // Send to ML service
      const mlResponse = await fetch('http://localhost:8000/generate', {
        method: 'POST',
        body: formData
      });

      if (!mlResponse.ok) {
        throw new Error(`ML service error: ${mlResponse.status}`);
      }

      // Process and store transformed audio
      const transformedBuffer = Buffer.from(await mlResponse.arrayBuffer());
      const transformedFileName = `transformed_${req.file.originalname}`;
      
      transformedUrl = await uploadAudio(
        transformedBuffer,
        transformedFileName,
        'transformed-audio',
        req.user.id.toString()
      );

      // Save URLs to database
      await saveAudioPair(req.user.id, originalUrl, transformedUrl);

      // Return success response
      res.json({
        success: true,
        data: {
          originalUrl,
          transformedUrl
        }
      });

    } catch (error) {
      // Attempt cleanup on failure
      if (originalUrl) {
        await deleteAudio(originalUrl, 'original-audio').catch(console.error);
      }
      if (transformedUrl) {
        await deleteAudio(transformedUrl, 'transformed-audio').catch(console.error);
      }
      
      next(createError('Audio processing failed', 500, error));
    } finally {
      // Clean up temporary file
      await fs.unlink(tempFilePath).catch(console.error);
    }
  },

  // Retrieve user's audio pairs
  getUserAudio: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const client = await pool.connect();
      const result = await client.query(
        `SELECT 
          o.id as original_id,
          o."audioURL" as original_url,
          t."audioURL" as transformed_url,
          o.created_at
         FROM audio o
         LEFT JOIN audio t ON o.id = t.pair_id
         WHERE o.user_id = $1
         AND o.file_type = 'original'
         ORDER BY o.created_at DESC`,
        [req.params.user_id]
      );
      
      res.json({ 
        success: true,
        data: result.rows 
      });
      client.release();
    } catch (error) {
      next(createError('Failed to fetch audio', 500, error));
    }
  }
};

// Helper function to save audio pair to database
const saveAudioPair = async (userId: number, originalUrl: string, transformedUrl: string) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const originalResult = await client.query(
      `INSERT INTO audio (user_id, "audioURL", file_type, is_saved)
       VALUES ($1, $2, 'original', true)
       RETURNING id`,
      [userId, originalUrl]
    );

    await client.query(
      `INSERT INTO audio (user_id, "audioURL", file_type, is_saved, pair_id)
       VALUES ($1, $2, 'transformed', true, $3)`,
      [userId, transformedUrl, originalResult.rows[0].id]
    );

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Error helper function
const createError = (message: string, status: number = 500, originalError: any = null): CustomError => ({
  log: `Audio Controller Error: ${message} - ${originalError?.message || 'Unknown error'}`,
  status,
  message: { err: message }
});

// Example usage:
/*
// Upload and transform audio
POST /api/upload
- Requires authenticated user
- Requires file upload
- Returns { success: true, data: { originalUrl, transformedUrl } }

// Get user's audio pairs
GET /api/audio/:userId
- Returns { success: true, data: [{ original_id, original_url, transformed_url, created_at }] }
*/

export default audioController;