import { Request, Response, NextFunction } from "express";
import { supabase } from '../model/db';
import pool from "../model/db";

const audioController = {
  upload: async (req: Request, res: Response, next: NextFunction) => {
    console.log('audioController.upload is hit');
    
    try {
      // Step 1: Validate request
      if (!req.file) {
        console.error('Error: No file uploaded');
        return res.status(400).json({ error: 'No file uploaded' });
      }
      console.log('File received:', req.file.originalname);

      // For testing purposes, use a test user_id like testMiddleware does
      const user_id = 'ce2639c3-4a75-44d2-b11b-c0f87d544873'; // test user's id

      // Step 2: Upload to storage
      const bucketName = 'audioStorage';
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(req.file.originalname, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: true
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        return res.status(500).json({ 
          error: 'Storage upload failed',
          details: uploadError.message 
        });
      }

      // Step 3: Get public URL
      const { data: publicUrlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(req.file.originalname);

      if (!publicUrlData?.publicUrl) {
        console.error('Failed to get public URL');
        return res.status(500).json({ error: 'Failed to get file URL' });
      }

      // Step 4: Save to database
      const client = await pool.connect();
      try {
        const query = `
          INSERT INTO audio (user_id, "audioURL") 
          VALUES ($1, $2) 
          RETURNING *
        `;
        const values = [user_id, publicUrlData.publicUrl];
        
        const result = await client.query(query, values);
        console.log('Audio record created:', result.rows[0]);

        return next();
      } finally {
        client.release();
      }

    } catch (error: any) {
      console.error('[Error] Exception in upload:', {
        message: error.message,
        stack: error.stack,
      });
      return res.status(500).json({ 
        error: 'Internal Server Error',
        details: error.message 
      });
    }
  }
};

export default audioController;