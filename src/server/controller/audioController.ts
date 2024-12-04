import { Request, Response, NextFunction } from 'express';
import { supabase } from '../model/db';
import pool from '../model/db';
import * as fs from 'node:fs/promises';

// [Note] This is a test middleware to check if the server works
const audioController = {
  upload: async (req: Request, res: Response, next: NextFunction) => {
    console.log('audioController.upload is hit');
    console.log('file', req.file);
    if (req.file) {
      try {
        //read uploaded file and convert into a blob for sending over http
        const audioFileHandle = await fs.open(req.file.path);
        const audioStream = await audioFileHandle.readFile();
        const audioBlob = new Blob([audioStream])
        audioFileHandle.close();

        const formData = new FormData();
        formData.append('audio_file', audioBlob);

        const requestHeaders: HeadersInit = new Headers();

        const mlResponse = await fetch(
          'http://localhost:8000/generate',
          {
            method: 'POST',
            headers: requestHeaders,
            body: formData
          }
        );
        
        console.log('mlResponse:', mlResponse.body);
        res.status(275);
        
        mlResponse.body.pipeTo(res);

        
      } catch (error: any) {
        console.error('Error:', error);
        res.status(500).json({
          error: error.message
        });
      }
    }
    return next();
  },

  // upload audio file to a test user
  uploadAudioToSupabase: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    // Test configuration
    const fileName = 'test_audio.mp3'; // temporary file name
    const bucketName = 'audioStorage'; // bucket name to store audio files
    const user_id = 'ce2639c3-4a75-44d2-b11b-c0f87d544873'; // 'test' user's id
    const filePath =
      '/Users/shunito/Documents/codesmith/senior/reinforcement/test_audio.mp3'; // temporary file path

    console.log('middleware hit');

    try {
      // Read the file
      const fileContent = await fs.readFile(filePath);

      // Step 1: Upload the file to Supabase Storage

      console.log('file content', fileContent);

      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, fileContent, {
          contentType: 'audio/mpeg',
          upsert: true,
        });

      if (uploadError) {
        throw new Error(
          `Error uploading file to storage: ${uploadError.message}`
        );
      }

      // Step 2: Get the public URL of the uploaded file
      const { data: publicUrlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);
      const publicUrl = publicUrlData.publicUrl;

      if (!publicUrl) {
        throw new Error('Error retrieving public URL of the file');
      }

      console.log(`File uploaded successfully. Public URL: ${publicUrl}`);

      // Step 3: Insert the file URL into the PostgreSQL database using `pg`
      const client = await pool.connect();
      try {
        const query = `
            INSERT INTO audio (user_id, audioURL) 
            VALUES ($1, $2) 
            RETURNING *
          `;

        const values = [user_id, publicUrl];

        const result = await client.query(query, values);
        console.log(`Audio URL saved to database. Record:`, result.rows[0]);

        console.log(result.rows[0]);
      } finally {
        client.release(); // Ensure the connection is released back to the pool
      }

      return next();
    } catch (error: any) {
      console.error('Error:', error.message);
      throw error;
    }
  },
};

export default audioController;
