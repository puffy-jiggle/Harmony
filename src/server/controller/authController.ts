import { Request, Response, NextFunction } from "express";
import bcrypt from 'bcrypt';
import jwt, {JwtPayload } from 'jsonwebtoken'
// import pool from '../model/db'
import { supabase } from '../model/db';


const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || 'your_secret_key'; 

const authController = {

    login: async (req: Request, res: Response, next: NextFunction) => {
      console.log(req.body);
      const {username, email, password} = req.body
      try {
         if (!username || !email || !password) {
            return res.status(400).json({ message: 'All fields are required.' });
          }
        
      // Find the user by username 
      const {data: user, error} = await supabase
      .from('users')
      .select('id, username, email, password')
      .eq('username', username)
      .single();

      if (error || !user) {
        return res.status(400).json({ message: 'User not found'})
      }

      // Compare the password with the hashed password
      const passwordMatched = await bcrypt.compare(password, user.password)

      if (!passwordMatched) {
        return res.status(400).json({message: 'Insvalid credential' })
      }

      // Create a JWT token after successful login
      const token = jwt.sign(
        {id: user.id, username: user.username, email: user.email },
        JWT_SECRET_KEY, // Secret key used to sign the token
        { expiresIn: '1h' } // Token expiration time (1hour)
      );

  res.status(200).json({ message: 'Login successful', token });  
        return next();
      } catch (error) {
      console.error('Error loggin in user:', error);
      res.status(500).json({ message: 'Internal server error', error})
      }
    },

    register: async (req: Request, res: Response, next: NextFunction) => {
      const { username, email, password } = req.body;
    
    try {
      const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ message: 'Email is already in use.'});
    }
    
    //Hash the password using bcrypt
    const salt = 10;
    const hashedPassword = await bcrypt.hash(password, salt)

    //Insert user into the database
    const { data, error } = await supabase
    .from('users')
    .insert([
      {
        username,
        email,
        password: hashedPassword,
      },
    ]);

    if (error) {
      return res.status(500).json({ message: 'Failed to create user', error });
    }
    res.status(201).json({ message: 'User created successfully', user: data })
    next() 
    }catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ message: 'Internal server error', error})
    }
  }
}
  
  export default authController;