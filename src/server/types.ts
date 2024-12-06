import { Request } from 'express';

// Custom Error Type 
export type CustomError = {
  log: string,
  status: number,
  message: string | {err: string}
};

// JWT Payload Type
export interface JWTPayload {
  id: number;
  username: string;
}

// Audio Storage Types
export interface AudioStorageResponse {
  originalUrl: string;
  transformedUrl: string;
}

export type AudioBucketName = 'original-audio' | 'transformed-audio';

export interface AudioRecord {
  id: number;
  user_id: number;
  audioURL: string;
  file_type: 'original' | 'transformed';
  is_saved: boolean;
  pair_id?: number;
  created_at: Date;
}

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}