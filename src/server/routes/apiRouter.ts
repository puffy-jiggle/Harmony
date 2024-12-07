// Import and configuration 
import express from 'express';
import { Request, Response, NextFunction } from "express";
import audioMiddleware from '../controller/audioMiddleware';
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
  console.log('Auth header:', req.headers.authorization);
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    console.log('No auth header fond');
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1]; // Bearer <token>
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY || 'your_secret_key') as JWTPayload;
    console.log('Decoded token: ', decoded);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Existing routes
router.get('/test', audioMiddleware.testFunction, (req: Request, res: Response, next: NextFunction) => {
  res.status(200).send('response from api/test route');
});

router.post('/test', audioMiddleware.testFunction, (req: Request, res: Response, next: NextFunction) => {
  res.status(200).send('response from api/test route');
});

router.post('/save-audio', 
  verifyToken, 
  audioMiddleware.saveAudioPair
);

// router.post('/save-audio', 
//   verifyToken, 
//   audioMiddleware.saveAudioPair, 
//   (req: Request, res: Response) => {
//     res.json({ 
//       success: true,
//       message: 'Audio pair saved successfully',
//       data: res.locals.audioSave
//     });
//   }
// );

// router.get('/audiotest', audioMiddleware.uploadAudioToSupabase, (req: Request, res: Response, next: NextFunction) => {
//   res.status(200).send('response from api/audiotest route');
// });

router.post('/upload', 
  fileUpload.single('file'),
  audioController.upload
); 

router.post('/login', authController.login, (req: Request, res: Response, next: NextFunction) => {
  res.status(200).send('response from api/login route')
});

router.post('/register', authController.register);

// router.get('/audio/:user_id', audioMiddleware.getUserAudio, (req: Request, res: Response, next: NextFunction) => {
//   res.status(200).send('response from ')
// });

router.get('/audio/:user_id', 
  audioMiddleware.getUserAudio
);

router.post('/save-audio', 
  verifyToken, 
  audioMiddleware.saveAudioPair, 
  (req: Request, res: Response) => {
    res.json({ 
      success: true,
      message: 'Audio pair saved successfully',
      data: res.locals.audioSave
    });
  }
);

export default router;