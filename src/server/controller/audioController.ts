/**
 * Audio Controller
 * Handles file transformation and storage with detailed logging
 */

import { Request, Response, NextFunction } from 'express';
import { uploadAudio, generateSignedUrl } from '../model/storage';
import { supabase } from '../model/db';
import pool from '../model/db';
import * as fs from 'node:fs/promises';
import { CustomError, AudioStorageResponse, TransformResponse } from '../types';

const audioController = {
  // Transform audio - no auth required
  transform: async (req: Request, res: Response, next: NextFunction) => {
    console.log('Transform endpoint hit');
    console.log('Request file:', req.file);
  
    if (!req.file) {
      const err: CustomError = {
        log: 'No file uploaded for transformation',
        status: 400,
        message: { err: 'No file uploaded' },
      };
      return next(err);
    }
  
    try {
      // Read uploaded file
      console.log('Reading file from:', req.file.path);
      const fileContent = await fs.readFile(req.file.path);
      console.log('File read successfully, size:', fileContent.length);
  
      // Send to ML service
      console.log('Sending to ML service...');
      const formData = new FormData();
      formData.append(
        'audio_file',
        new File([fileContent], req.file.originalname, {
          type: req.file.mimetype,
        })
      );
  
      const mlResponse = await fetch('http://localhost:8000/generate', {
        method: 'POST',
        body: formData,
      });
  
      if (!mlResponse.ok) {
        console.error('ML service error:', mlResponse.status);
        throw new Error(`ML service error: ${mlResponse.status}`);
      }
  
      // Send transformed audio directly back to client
      const transformedBuffer = Buffer.from(await mlResponse.arrayBuffer());
      console.log('Transformed audio size:', transformedBuffer.length);
  
      res.set('Content-Type', 'audio/wav');
      res.send(transformedBuffer);
    } catch (error) {
      console.error('Error in transform:', 
        error instanceof Error ? { message: error.message, stack: error.stack } : error
      );
    
      const err: CustomError = {
        log: `Audio transformation failed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
        status: 500,
        message: { err: 'Audio transformation failed' },
      };
      next(err);
    }
    
      finally {
      // Clean up temp file
      if (req.file?.path) {
        console.log('Cleaning up temp file:', req.file.path);
        await fs.unlink(req.file.path).catch((err) =>
          console.error('Temp file cleanup error:', err)
        );
      }
    }
  },
  
  // Upload and save to Supabase - auth required
  upload: async (req: Request, res: Response, next: NextFunction) => {
    console.log('Upload request body:', req.body);
    console.log('Upload files received:', req.files);
    console.log('Request user:', req.user);
  
    if (!req.files || !req.user) {
      const err: CustomError = {
        log: 'Validation failed in upload',
        status: 400,
        message: { err: 'No files uploaded or user not authenticated' }
      };
      return next(err);
    }
  
    const files = req.files as {
      originalFile: Express.Multer.File[];
      transformedFile: Express.Multer.File[];
    };
  
    try {
      // Upload original file
      const originalFilePath = `${req.user.id}/${Date.now()}_${files.originalFile[0].originalname}`;
      const { error: originalError } = await supabase.storage
        .from('original-audio')
        .upload(originalFilePath, await fs.readFile(files.originalFile[0].path), {
          contentType: files.originalFile[0].mimetype,
        });
  
      if (originalError) throw originalError;
  
      const originalUrl = await generateSignedUrl('original-audio', originalFilePath);
  
      // Upload transformed file
      const transformedFilePath = `${req.user.id}/${Date.now()}_transformed_${files.transformedFile[0].originalname}`;
      const { error: transformedError } = await supabase.storage
        .from('transformed-audio')
        .upload(transformedFilePath, await fs.readFile(files.transformedFile[0].path), {
          contentType: 'audio/wav',
        });
  
      if (transformedError) throw transformedError;
  
      const transformedUrl = await generateSignedUrl('transformed-audio', transformedFilePath);
  
      // Respond with URLs
      res.json({
        success: true,
        data: {
          originalUrl,
          transformedUrl,
        },
      });
    } catch (error) {
      console.error('Error in upload:', error);
      next(error);
    } finally {
      // Clean up files
      if (files.originalFile?.[0]?.path) {
        await fs.unlink(files.originalFile[0].path).catch((err) =>
          console.error('Error cleaning original file:', err)
        );
      }
      if (files.transformedFile?.[0]?.path) {
        await fs.unlink(files.transformedFile[0].path).catch((err) =>
          console.error('Error cleaning transformed file:', err)
        );
      }
    }
  },
};
  

export default audioController;