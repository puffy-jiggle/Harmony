/**
 * Audio Controller
 * Handles file upload, storage, and ML service integration
 */

import { Request, Response, NextFunction } from 'express';
import { uploadAudio } from '../model/storage';
import pool from '../model/db';
import * as fs from 'node:fs/promises';
import { CustomError, AudioStorageResponse } from '../types';

const audioController = {
  upload: async (req: Request, res: Response, next: NextFunction) => {
    console.log('Upload endpoint hit');
    console.log('Request file:', req.file);
    console.log('Request user:', req.user);

    if (!req.file || !req.user) {
      const err: CustomError = {
        log: 'Validation failed in upload',
        status: 400,
        message: { err: 'No file uploaded or user not authenticated' }
      };
      return next(err);
    }

    try {
      // Read uploaded file
      console.log('Reading file from:', req.file.path);
      const fileContent = await fs.readFile(req.file.path);
      console.log('File read successfully, size:', fileContent.length);

      // Upload original to Supabase
      console.log('Uploading original file...');
      const originalUrl = await uploadAudio({
        fileContent,
        fileName: req.file.originalname,
        contentType: req.file.mimetype,
        userId: req.user.id.toString(),
        bucketName: 'original-audio'
      });

      // Prepare ML service request
      console.log('Sending to ML service...');
      const formData = new FormData();
      formData.append('audio_file', new File([fileContent], req.file.originalname, {
        type: req.file.mimetype
      }));

      const mlResponse = await fetch('http://localhost:8000/generate', {
        method: 'POST',
        body: formData
      });

      if (!mlResponse.ok) {
        throw new Error(`ML service error: ${mlResponse.status}`);
      }

      // Process transformed audio
      console.log('Processing transformed audio...');
      const transformedBuffer = Buffer.from(await mlResponse.arrayBuffer());
      const transformedFileName = `transformed_${req.file.originalname}`;

      // Upload transformed to Supabase
      const transformedUrl = await uploadAudio({
        fileContent: transformedBuffer,
        fileName: transformedFileName,
        contentType: 'audio/wav',
        userId: req.user.id.toString(),
        bucketName: 'transformed-audio'
      });

      // Store URLs in database
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // Save original audio URL
        const originalResult = await client.query(
          `INSERT INTO audio (user_id, "audioURL", file_type, is_saved)
           VALUES ($1, $2, 'original', true)
           RETURNING id`,
          [req.user.id, originalUrl]
        );

        // Save transformed audio URL with reference to original
        await client.query(
          `INSERT INTO audio (user_id, "audioURL", file_type, is_saved, pair_id)
           VALUES ($1, $2, 'transformed', true, $3)`,
          [req.user.id, transformedUrl, originalResult.rows[0].id]
        );

        await client.query('COMMIT');

        // Send response
        const response: AudioStorageResponse = {
          originalUrl,
          transformedUrl
        };

        res.json({
          success: true,
          data: response
        });

      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }

    } catch (error) {
      console.error('Error in upload:', error instanceof Error ? {
        message: error.message,
        stack: error.stack
      } : error);

      const err: CustomError = {
        log: `Audio processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        status: 500,
        message: { err: 'Audio processing failed' }
      };
      next(err);

    } finally {
      // Clean up temp file
      if (req.file?.path) {
        console.log('Cleaning up temp file:', req.file.path);
        await fs.unlink(req.file.path)
          .catch(err => console.error('Temp file cleanup error:', err));
      }
    }
  }
};

export default audioController;