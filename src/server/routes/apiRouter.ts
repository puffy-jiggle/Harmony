// Import and configuration 
import express from 'express';
import { Request, Response, NextFunction } from "express";
import testMiddleware from '../controller/testMiddleware';
import audioController from '../controller/audioController';
import path from 'path';

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

// [Note] This is a test route to check if the server works. 
router.get('/test', testMiddleware.testFunction, (req: Request, res: Response, next: NextFunction) => {
  res.status(200).send('response from api/test route');
});

router.get('/audiotest', testMiddleware.uploadAudioToSupabase, (req: Request, res: Response, next: NextFunction) => {
  res.status(200).send('response from api/audiotest route');
});


// [Note] This is a test route to check if the server works. 
router.post('/upload', fileUpload.single('file'), audioController.upload, (req: Request, res: Response, next: NextFunction) => {
  res.status(200).send('response from api/test route');
});

export default router;

