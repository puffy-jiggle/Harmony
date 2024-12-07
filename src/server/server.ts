import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { CustomError } from './types';
import apiRouter from './routes/apiRouter';
import { setupStorage } from './model/storage';

const app = express();
const PORT = 4040;

// Core middleware
app.use(cors());
app.use(cookieParser());
app.use(express.json());

// API routes
app.use('/api', apiRouter);

// Static file serving and client routing (production only)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.resolve(__dirname, '..', '..', 'public'))); 
  
  app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '..', '..', 'public', 'index.html'));
  });
}

// Error handling middleware
app.use((err: CustomError, req: Request, res: Response, next: NextFunction) => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  console.error(`[Error] ${typeof message === 'string' ? message : message.err}`);

  res.status(status).json({
    status: 'error',
    statusCode: status,
    message: message,
  });
});

// Initialize storage and start server
const init = async () => {
  try {
    await setupStorage();
    console.log('Storage buckets initialized successfully');
    
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to initialize storage buckets:', error);
    process.exit(1);  // Exit if storage setup fails
  }
};

init().catch(error => {
  console.error('Server initialization failed:', error);
  process.exit(1);
});