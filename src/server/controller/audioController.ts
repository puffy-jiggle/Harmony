import { Request, Response, NextFunction } from "express";



// [Note] This is a test middleware to check if the server works 
const audioController = {

  upload: async (req: Request, res: Response, next: NextFunction) => {
    console.log('audioController.upload is hit');
    console.log(req.body);
    return next();
  },

}

export default audioController;