import { Request, Response } from "express";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'
import {OAuth2Client} from 'google-auth-library'
// import pool from '../model/db'
import { supabase } from '../model/db';


// Load environment variables
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || 'your_secret_key';
const CLIENT_ID = process.env.CLIENT_ID;

// Define the User type
interface User {
  id: string;
  username: string;
  email: string;
}

// JWT Generation Function
const generateJwt = (user: User) => {
  return jwt.sign(
    { id: user.id, username: user.username, email: user.email },
    JWT_SECRET_KEY,
    { expiresIn: '2h' }
  );
};

const authController = {
  // Manual login function using bcrypt for password comparison
  login: async (req: Request, res: Response): Promise<Response> => {
    const { username, password } = req.body;

    try {
      if (!username || !password) {
        return res.status(400).json({ message: 'All fields are required.' });
      }

      // Query Supabase to find user by username
      const { data: user, error } = await supabase
        .from('users')
        .select('id, username, password, email')
        .eq('username', username)
        .single();

      if (error || !user) {
        return res.status(400).json({ message: 'User not found' });
      }

      // Compare the password with the hashed password stored in the database
      const passwordMatched = await bcrypt.compare(password, user.password);
      console.log('passwordMatched', passwordMatched)

      if (!passwordMatched) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Generate JWT token
      const token = generateJwt(user);
      console.log('token in login', token)

      return res.status(200).json({ message: 'Login successful', token });

    } catch (error) {
      console.error('Error logging in user:', error);
      return res.status(500).json({ message: 'Internal server error', error });
    }
  },

  // Google OAuth login function using Google Auth Library (OAuth2Client)
  googleLogin: async (req: Request, res: Response): Promise<Response> => {
    const { token } = req.body;
    const client = new OAuth2Client(CLIENT_ID);
    console.log('client from OAUTH', client)

    try {
      // Verify the Google ID token
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,
      });

      const payload = ticket.getPayload();

      if (!payload) {
        return res.status(400).json({ message: 'Invalid token' });
      }

      // Get or create user in the database based on Google payload
      const user = await getOrCreateUser(payload);
      console.log('user in google oauth', user )

      // Generate JWT token
      // const jwtToken = generateJwt(user);

      return res.json({ token: user})
      // return res.json({ token: jwtToken, user });
    } catch (error) {
      console.error('Google token verification failed:', error);
      return res.status(400).send('OAuth verification failed');
    }
  },
  register: async (req: Request, res: Response) => {
    const { username, email, password } = req.body;
    console.log('checking req body', username, email, password)
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
  const { data:user, error } = await supabase
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

  return res.status(201).json({ message: 'User created successfully', user: user })

  }catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Internal server error', error})
  }
}
};

// Helper function to get or create a user
const getOrCreateUser = async (payload: any) => {
  const user: User = {
    username: payload.name,
    email: payload.email,
    id: payload.sub, // Use the unique Google ID (sub) as the user ID
  };

  // Query Supabase to check if the user already exists
  const { data: existingUser, error } = await supabase
    .from('users')
    .select('id, username, email')
    .eq('email', user.email)
    .single();

  if (error || !existingUser) {
    // If user does not exist, create a new user
    const { data: newUser, error: createUserError } = await supabase
      .from('users')
      .insert([
        {
          username: user.username,
          email: user.email,
          password: 'oauth_user', // Placeholder password for OAuth users
        },
      ])
      .single();

    if (createUserError) {
      throw createUserError; // Throw error to be caught by the outer try-catch
    }

  //   user.id = newUser.id as string;
  //   user.username = newUser.username;
  // } else {
  //   user.id = existingUser.id as string;
  //   user.username = existingUser.username;
  // }

  return newUser;
};
  
}
  export default authController;