import express, { Request, Response, NextFunction } from 'express';
import { CustomError } from './types';
import path from 'path';
import cors from 'cors';

const app = express();
const PORT: number = 8080;

app.use(cors());
// Import router 
const apiRouter = require('./routes/apiRouter');

// Middleware setup 
app.use(express.static(path.resolve(__dirname, '..', '..', 'public'))); 
app.use(express.json());
const cookieParser = require('cookie-parser');

// API routes
app.use('/api', apiRouter);
app.get('/login', (req:Request, res: Response)  => {
console.log('hello checking get method')
})

app.post('/login', (req: Request, res: Response) => {
  console.log('Login data received:', req.body);  // Check if the backend is receiving the request
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
  }
  res.status(200).json({ message: 'Login successful', data: { username, email } });
});

 
// Serve React app for all other routes
app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '..', '..', 'public', 'index.html'));
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

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});