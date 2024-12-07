import express from 'express';
import { Request, Response, NextFunction } from "express";
import audioMiddleware from '../controller/audioMiddleware';
import audioController from '../controller/audioController';
import authController from '../controller/authController';
import path from 'path';
import jwt from 'jsonwebtoken';
import { JWTPayload } from '../types';
import multer from 'multer';

const router = express.Router();

// Multer storage configuration
const multerStorage = multer.diskStorage({
  filename: (
    req: Request, 
    file: Express.Multer.File, 
    cb: (error: Error | null, filename: string) => void
  ) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
  destination: (
    req: Request, 
    file: Express.Multer.File, 
    cb: (error: Error | null, destination: string) => void
  ) => {
    cb(null, path.resolve(__dirname, "../uploads"));
  }
});

const fileUpload = multer({ storage: multerStorage });

// JWT verification middleware
const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  console.log('Auth header:', req.headers.authorization);
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    console.log('No auth header found');
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1]; // Bearer <token>
  try {
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET_KEY || 'your_secret_key'
    ) as JWTPayload;
    
    console.log('Decoded token:', decoded);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Auth routes
router.post('/login', authController.login);
router.post('/register', authController.register);

// Public audio route - no auth required
router.post('/transform',
  fileUpload.single('file'),
  audioController.transform
);

// Protected audio routes - auth required
router.post('/upload',
  verifyToken,
  fileUpload.fields([
    { name: 'originalFile', maxCount: 1 },
    { name: 'transformedFile', maxCount: 1 }
  ]),
  audioController.upload
);

router.post('/save-audio',
  verifyToken,
  fileUpload.fields([
    { name: 'originalFile', maxCount: 1 },
    { name: 'transformedFile', maxCount: 1 }
  ]),
  (req: Request, res: Response, next: NextFunction) => {
    console.log('Save-audio endpoint hit');
    console.log('Files received:', req.files);

    const files = req.files as { 
      originalFile?: Express.Multer.File[], 
      transformedFile?: Express.Multer.File[] 
    };

    if (files?.originalFile?.[0]) {
      console.log('Original file path:', files.originalFile[0].path);
    } else {
      console.error('Original file is missing');
    }

    if (files?.transformedFile?.[0]) {
      console.log('Transformed file path:', files.transformedFile[0].path);
    } else {
      console.error('Transformed file is missing');
    }

    console.log('Body received:', req.body);
    console.log('User:', req.user);
    next();
  },
  audioMiddleware.saveAudioPair,
  (req: Request, res: Response) => {
    res.json({
      success: true,
      message: 'Audio pair saved successfully',
      data: res.locals.audioSave,
    });
  }
);





router.get('/audio/:user_id',
  verifyToken,
  audioMiddleware.getUserAudio
);

// Keep existing routes for backward compatibility
router.post('/upload-legacy',
  verifyToken,
  fileUpload.single('file'),
  audioController.upload
);

export default router;