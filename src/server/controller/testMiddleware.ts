import { Request, Response, NextFunction } from "express";
import { supabase } from '../model/db'
import pool from "../model/db";
import * as fs from 'fs';

// [Note] This is a test middleware to check if the server works 
const testMiddleware = {

  // test function 
  testFunction: async (req: Request, res: Response, next: NextFunction) => {
    console.log('testFunction is hit');
    return next();
  },

  // upload audio file to a test user 
  uploadAudioToSupabase: async (req: Request, res: Response, next: NextFunction) => {

    // Test configuration 
    const fileName = 'test_audio.mp3' // temporary file name 
    const bucketName = 'audioStorage'; // bucket name to store audio files 
    const user_id = 'ce2639c3-4a75-44d2-b11b-c0f87d544873' // 'test' user's id 
    const filePath = '/Users/shunito/Documents/codesmith/senior/reinforcement/test_audio.mp3'; // temporary file path 

    console.log('middleware hit')

    try {
      // Read the file
      const fileContent = fs.readFileSync(filePath);
  
      // Step 1: Upload the file to Supabase Storage

      console.log('file content', fileContent);

      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, fileContent, { contentType: 'audio/mpeg', upsert: true });
  
      if (uploadError) {
        throw new Error(`Error uploading file to storage: ${uploadError.message}`);
      }
  
      // Step 2: Get the public URL of the uploaded file
      const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(fileName);
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
  }


  // get audio file from a user 


}

export default testMiddleware;

