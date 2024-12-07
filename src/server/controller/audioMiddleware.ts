import { Request, Response, NextFunction } from "express";
import { supabase } from '../model/db';
import pool from "../model/db";
import { CustomError, AudioStorageResponse } from '../types';

const audioMiddleware = {
  // Save audio URLs to database
  saveAudioPair: async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log('SaveAudioPair middleware hit');
      console.log('Request Body:', req.body);
      console.log('Files:', req.files);
      console.log('User:', req.user);
  
      // Extract URLs from the request body
      const { originalUrl, transformedUrl } = req.body;
  
      // Validation: Ensure URLs are provided
      if (!originalUrl || !transformedUrl) {
        const err: CustomError = {
          log: 'Missing audio URLs in request',
          status: 400,
          message: { err: 'Missing audio URLs' },
        };
        console.error('Validation error:', err);
        return next(err); // Close the if block before continuing
      }
  
      const client = await pool.connect();
      try {
        console.log('Saving original and transformed URLs to the database...');
        await client.query('BEGIN');
  
        // Insert the original audio URL into the database
        const originalResult = await client.query(
          `INSERT INTO audio (user_id, "audioURL", file_type, is_saved)
           VALUES ($1, $2, 'original', true)
           RETURNING id`,
          [req.user?.id, originalUrl]
        );
        console.log('Original audio database entry:', originalResult.rows[0]);
  
        // Insert the transformed audio URL into the database, linking it to the original
        await client.query(
          `INSERT INTO audio (user_id, "audioURL", file_type, is_saved, pair_id)
           VALUES ($1, $2, 'transformed', true, $3)`,
          [req.user?.id, transformedUrl, originalResult.rows[0].id]
        );
  
        await client.query('COMMIT');
        console.log('Database transaction committed');
  
        // Add response data to `res.locals`
        res.locals.audioSave = { 
          originalUrl, 
          transformedUrl, 
          userId: req.user?.id 
        };
  
        next();
      } catch (dbError) {
        console.error('Database transaction error:', dbError);
        await client.query('ROLLBACK');
        next(dbError);
      } finally {
        client.release();
      }
    } catch (error) {
      console.error(
        'Error in saveAudioPair:',
        error instanceof Error ? { message: error.message, stack: error.stack } : error
      );
  
      const err: CustomError = {
        log: 'Error in saveAudioPair middleware',
        status: 500,
        message: { err: 'Failed to save audio' },
      };
      next(err);
    }
  },
  
  

  // Get user's saved audio pairs
  getUserAudio: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.params.user_id) {
        const err: CustomError = {
          log: 'No user_id provided',
          status: 400,
          message: { err: 'User ID is required' }
        };
        return next(err);
      }

      const client = await pool.connect();
      try {
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
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error fetching audio:', error);
      const err: CustomError = {
        log: 'Error in getUserAudio middleware',
        status: 500,
        message: { err: 'Failed to fetch audio' }
      };
      next(err);
    }
  }
}

export default audioMiddleware;