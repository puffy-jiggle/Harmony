// Import and configuration 
import express from 'express';
import { Request, Response, NextFunction } from "express";
import testMiddleware from '../controller/testMiddleware';

const router = express.Router();

// [Note] This is a test route to check if the server works. 
router.get('/test', testMiddleware.testFunction, (req: Request, res: Response, next: NextFunction) => {
  res.status(200).send('response from api/test route');
});

module.exports = router;