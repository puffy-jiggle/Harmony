// Import and configuration 
import express, { Request, Response, NextFunction } from 'express';
import { CustomError } from './types';

const app = express();
const PORT: number = 3000;
const path = require('path');
const cookieParser = require('cookie-parser');

// Import router 
const apiRouter = require('./routes/apiRouter');

// Middleware setup 

app.use(express.static(path.resolve(__dirname, '..', '..', 'public'))); // [TODO] confirm static files path 
app.use(express.json());
app.use(cookieParser());

// Routes

app.get('/', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '..', '..', 'public', 'index.html')); // [TODO] confirm index.html path 
});

app.use('/api', apiRouter); // [NOTE] set up apiRouter for test purpose

// Catch-all route handler for any requests to an unknown route 
app.use('*', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '..', '..', 'public', 'index.html')) // [TODO] confirm index.html path
});

// Error handling 
app.use((err: CustomError, req: Request, res: Response, next: NextFunction) => {
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";
  console.error(`[Error] ${message}`);

  res.status(status).json({
    status: "error",
    statusCode: status,
    message: message,
  });

});

// Start the server 
const Port = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

