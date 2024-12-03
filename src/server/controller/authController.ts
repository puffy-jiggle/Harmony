import { Request, Response, NextFunction } from "express";
import bcrypt from 'bcrypt';
import jwt, {JwtPayload } from 'jsonwebtoken'

const authController = {

    login: async (req: Request, res: Response, next: NextFunction) => {
      console.log('authController.login is hit');
      console.log(req.body);
      const {username, email, password} = req.body
      try {
        if(!username || !email || !password) {
            console.error('incomplete form')
        }
        
        return next();
      } catch (error) {
        return next(error)
      }
    }
  
  }
  
  export default authController;