import { Request, Response, NextFunction } from 'express';
import * as fs from 'node:fs/promises';

const audioController = {
  upload: async (req: Request, res: Response, next: NextFunction) => {
    console.log('audioController.upload is hit');
    console.log('file', req.file);
    
    if (!req.file) {
      return next(new Error('No file uploaded'));
    }

    try {
      // Read the uploaded file
      const audioFileHandle = await fs.open(req.file.path);
      const audioStream = await audioFileHandle.readFile();
      const audioFile = new File([audioStream], req.file.originalname, {
        type: req.file.mimetype
      });
      await audioFileHandle.close();

      // Create form data for ML service
      const formData = new FormData();
      formData.append('audio_file', audioFile);

      // Send to ML service
      const mlResponse = await fetch('http://localhost:8000/generate', {
        method: 'POST',
        headers: new Headers(),
        body: formData
      });

      if (!mlResponse.ok) {
        throw new Error(`ML service error: ${mlResponse.status}`);
      }

      // Get the response as buffer and send it back
      const responseBuffer = await mlResponse.arrayBuffer();
      
      // Send only one response
      res.set('Content-Type', 'audio/wav');
      return res.status(200).send(Buffer.from(responseBuffer));
      // Remove the next() call since we've already sent a response

    } catch (error: any) {
      console.error('Error in upload:', error);
      next(error);
    }
  }
};

export default audioController;