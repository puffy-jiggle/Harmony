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
      // Read uploaded file
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

      // Send back the transformed audio
      const responseBuffer = await mlResponse.arrayBuffer();
      res.type('audio/wav');
      res.status(200).send(Buffer.from(responseBuffer));

    } catch (error) {
      console.error('Error in upload:', error);
      next(error);
    }
  }
};

export default audioController;