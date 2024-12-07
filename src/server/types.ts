import { Request } from 'express';

// Error Types
export type CustomError = {
  log: string,
  status: number,
  message: string | {err: string}
};

// Auth Types
export interface JWTPayload {
  id: number;
  username: string;
}

// Storage Types
export type AudioBucketName = 'original-audio' | 'transformed-audio';

export interface AudioUpload {
  fileContent: Buffer;
  fileName: string;
  contentType: string;
  userId: string;
  bucketName: AudioBucketName;
}

// Response Types
export interface AudioStorageResponse {
  originalUrl: string;
  transformedUrl: string;
}

// Database Types
export interface AudioRecord {
  id: number;
  user_id: number;
  audioURL: string;
  file_type: 'original' | 'transformed';
  is_saved: boolean;
  pair_id?: number;
  created_at: Date;
}

// Express Extensions
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

// Transform Types
export interface TransformResponse {
  success: boolean;
  data: Buffer | {
    originalUrl: string;
    transformedUrl: string;
  };
}

// Existing types from your types.ts remain unchanged
// Add these new interfaces:

export interface AudioPair {
  original_id: number;
  original_url: string;
  transformed_url: string;
  created_at: string;
}

export interface NavigationProps {
  isLoggedIn?: boolean;
  onLogout?: () => void;
}

export interface MainLayoutProps {
  children: React.ReactNode;
}

export interface AudioPlayerProps {
  audioURL: string;
}

// Add these to your existing types.ts
export interface AudioPair {
  original_id: number;
  original_url: string;
  transformed_url: string;
  created_at: string;
}

export interface NavigationProps {
  isLoggedIn?: boolean;
  onLogout?: () => void;
}