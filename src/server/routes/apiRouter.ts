// Import and configuration 
import express from 'express';
import { Request, Response, NextFunction } from "express";

const path = require('path');
const router = express.Router();

// Import controllers 
const testMiddleware = require('../controller/testMiddleware.ts');

// Routes 

// [Note] This is a test route to check if the server works. 
router.get('/test', testMiddleware.testFunction, (req: Request, res: Response, next: NextFunction) => {
  res.status(200).send('response from api/test route');
});

module.exports = router;