import { Request, Response, NextFunction } from 'express';
import { uploadAudio, deleteAudio } from '../model/storage';
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

    const tempFilePath = req.file.path;
    let uploadedFiles: Partial<AudioStorageResponse> = {};

    try {
      // Read the uploaded file
      console.log('Reading file from:', tempFilePath);
      const fileBuffer = await fs.readFile(tempFilePath);
      console.log('File read successfully, size:', fileBuffer.length);
      
      // Store original in Supabase
      console.log('Uploading original file to storage...');
      uploadedFiles.originalUrl = await uploadAudio(
        fileBuffer,
        req.file.originalname,
        'original-audio',
        req.user.id.toString()
      );
      console.log('Original file uploaded:', uploadedFiles.originalUrl);

      // Prepare for ML service
      console.log('Preparing ML service request...');
      const formData = new FormData();
      formData.append('audio_file', new Blob([fileBuffer], { type: 'audio/wav' }));

      console.log('Sending to ML service...');
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
      console.log('Transformed audio size:', transformedBuffer.length);
      const transformedFileName = `transformed_${req.file.originalname}`;
      
      uploadedFiles.transformedUrl = await uploadAudio(
        transformedBuffer,
        transformedFileName,
        'transformed-audio',
        req.user.id.toString()
      );
      console.log('Transformed file uploaded:', uploadedFiles.transformedUrl);

      if (!uploadedFiles.originalUrl || !uploadedFiles.transformedUrl) {
        throw new Error('Failed to get URLs for uploaded files');
      }

      // Return success with URLs
      const response: AudioStorageResponse = {
        originalUrl: uploadedFiles.originalUrl,
        transformedUrl: uploadedFiles.transformedUrl
      };

      res.json({
        success: true,
        data: response
      });

    } catch (error) {
      // Cleanup on failure
      if (uploadedFiles.originalUrl) {
        await deleteAudio(uploadedFiles.originalUrl, 'original-audio')
          .catch((err: Error) => console.error('Cleanup error (original):', err));
      }
      if (uploadedFiles.transformedUrl) {
        await deleteAudio(uploadedFiles.transformedUrl, 'transformed-audio')
          .catch((err: Error) => console.error('Cleanup error (transformed):', err));
      }
      
      const err: CustomError = {
        log: `Audio processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        status: 500,
        message: { err: 'Audio processing failed' }
      };
      next(err);

    } finally {
      // Always cleanup temp file
      if (tempFilePath) {
        console.log('Cleaning up temp file:', tempFilePath);
        await fs.unlink(tempFilePath)
          .catch((err: Error) => console.error('Temp file cleanup error:', err));
      }
    }
  },

  // Rest of your controller...
};

export default audioController;