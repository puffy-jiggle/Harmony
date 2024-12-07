import { Request, Response, NextFunction } from "express";
import { supabase } from '../model/db';
import pool from "../model/db";
import { CustomError, AudioStorageResponse } from '../types';

const audioMiddleware = {
  // Save audio URLs to database
  saveAudioPair: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { originalUrl, transformedUrl } = req.body;
  
      if (!originalUrl || !transformedUrl) {
        const err: CustomError = {
          log: 'Missing audio URLs in request',
          status: 400,
          message: { err: 'Missing audio URLs' }
        };
        return next(err);
      }
  
      if (!req.user) {
        const err: CustomError = {
          log: 'User not authenticated',
          status: 401,
          message: { err: 'User not authenticated' }
        };
        return next(err);
      }
  
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
  
        res.locals.audioSave = {
          originalUrl,
          transformedUrl,
          userId: req.user.id
        };
  
        next();
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error saving audio:', error);
      const err: CustomError = {
        log: 'Error in saveAudioPair middleware',
        status: 500,
        message: { err: 'Failed to save audio' }
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
};

export default audioMiddleware;