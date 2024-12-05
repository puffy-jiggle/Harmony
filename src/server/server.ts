import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { CustomError } from './types';
import apiRouter from './routes/apiRouter';

const app = express();
const PORT = 4040;

// Core middleware
app.use(cors());
app.use(cookieParser());
app.use(express.json());



// app.get('/test', (req: Request, res: Response) => {
//   res.sendStatus(250)
// })


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
  console.error(`[Error] ${message}`);

  res.status(status).json({
    status: 'error',
    statusCode: status,
    message: message,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});