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

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}