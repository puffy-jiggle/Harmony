import { Request, Response, NextFunction } from "express";
import { supabase } from '../model/db';
import pool from "../model/db";

const audioMiddleware = {
  // Basic test function
  testFunction: async (req: Request, res: Response, next: NextFunction) => {
    console.log('testFunction is hit');
    console.log('request headers', req.headers);
    setTimeout(()=>{console.log('request body', req.body);}, 1000);
    return next();
  },

  // Save audio URLs to database
  saveAudioPair: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { originalUrl, transformedUrl } = req.body;
      if (!originalUrl || !transformedUrl) {
        return res.status(400).json({ error: 'Missing audio URLs' });
      }
      
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
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
        res.json({ success: true });

      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error saving audio:', error);
      res.status(500).json({ error: 'Failed to save audio' });
    }
  },

  // Get user's saved audio
  getUserAudio: async (req: Request, res: Response) => {
    try {
      const client = await pool.connect();
      const result = await client.query(
        'SELECT * FROM audio WHERE user_id = $1',
        [req.params.user_id]
      );
      
      res.json({ audioFiles: result.rows });
      client.release();
    } catch (error) {
      console.error('Error fetching audio:', error);
      res.status(500).json({ error: 'Failed to fetch audio' });
    }
  }
};

export default audioMiddleware;