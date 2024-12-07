// Import and configuration 
import express from 'express';
import { Request, Response, NextFunction } from "express";
import testMiddleware from '../controller/testMiddleware';
import audioController from '../controller/audioController';
import authController from '../controller/authController';
import path from 'path';
import jwt from 'jsonwebtoken';
import pool from '../model/db';
import { JWTPayload } from '../types'; 

const router = express.Router();

import multer, {FileFilterCallback} from 'multer';
type DestinationCallback = (error: Error | null, destination: string) => void
type FileNameCallback = (error: Error | null, filename: string) => void

// Middleware setup 
const multerStorage = multer.diskStorage({
  filename: function (req: Request, file: Express.Multer.File, cb: FileNameCallback){
    cb(null, file.originalname)
  },
  destination: function (req: Request, file: Express.Multer.File, cb: DestinationCallback){
    cb(null, path.resolve(__dirname, "../uploads"))
  }
})
const fileUpload = multer({storage: multerStorage})

// JWT verification middleware
// const verifyToken = (req: Request, res: Response, next: NextFunction) => {
//   const authHeader = req.headers.authorization;
//   if (!authHeader) {
//     return res.status(401).json({ error: 'No token provided' });
//   }

//   const token = authHeader.split(' ')[1]; // Bearer <token>
//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY || 'your_secret_key');
//     req.user = decoded;
//     next();
//   } catch (error) {
//     return res.status(401).json({ error: 'Invalid token' });
//   }
// };

const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1]; // Bearer <token>
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY || 'your_secret_key') as JWTPayload;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Existing routes
router.get('/test', testMiddleware.testFunction, (req: Request, res: Response, next: NextFunction) => {
  res.status(200).send('response from api/test route');
});

router.post('/test', testMiddleware.testFunction, (req: Request, res: Response, next: NextFunction) => {
  res.status(200).send('response from api/test route');
});

router.get('/audiotest', testMiddleware.uploadAudioToSupabase, (req: Request, res: Response, next: NextFunction) => {
  res.status(200).send('response from api/audiotest route');
});

router.post('/upload', fileUpload.single('file'), audioController.upload, (req: Request, res: Response, next: NextFunction) => {
  res.status(200).send('response from api/test route');
});

router.post('/login', authController.login, (req: Request, res: Response, next: NextFunction) => {
  res.status(200).send('response from api/login route')
});

router.post('/google-login', authController.googleLogin, (req: Request, res: Response, next: NextFunction) => {
  res.status(200).send('response from api/google-login route')
});

router.post('/register', authController.register);

router.get('/audio/:user_id', testMiddleware.getUserAudio, (req: Request, res: Response, next: NextFunction) => {
  res.status(200).send('response from ')
});

// New save-audio endpoint
// New save-audio endpoint
router.post('/save-audio', verifyToken, async (req: Request, res: Response) => {
  try {
    const { originalUrl, transformedUrl } = req.body;
    
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    const userId = req.user.id;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Insert original file
      const originalResult = await client.query(
        `INSERT INTO audio (user_id, "audioURL", file_type, is_saved)
         VALUES ($1, $2, 'original', true)
         RETURNING id`,
        [userId, originalUrl]
      );

      // Insert transformed file with same pair_id
      await client.query(
        `INSERT INTO audio (user_id, "audioURL", file_type, is_saved, pair_id)
         VALUES ($1, $2, 'transformed', true, $3)`,
        [userId, transformedUrl, originalResult.rows[0].id]
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
});

export default router;