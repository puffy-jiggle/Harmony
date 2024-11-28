import { Request, Response, NextFunction } from "express";

// [Note] This is a test middleware to check if the server works 
const testMiddleware = {

  testFunction: async (req: Request, res: Response, next: NextFunction) => {
    console.log('testFunction is hit');
    return next();
  },

}

module.exports = testMiddleware;