import { Request, Response, NextFunction } from "express";
import bcrypt from 'bcrypt';
import jwt, {JwtPayload } from 'jsonwebtoken'

const authController = {

    login: async (req: Request, res: Response, next: NextFunction) => {
      console.log('authController.login is hit');
      console.log(req.body);
      const {username, email, password} = req.body
      try {
         if (!username || !email || !password) {
            return res.status(400).json({ message: 'All fields are required.' });
          }

          
   res.status(200).json({ message: 'Login successful', data: { username, email } });  
        return next();
      } catch (error) {
        return next(error)
      }
    }
  }
  
  export default authController;