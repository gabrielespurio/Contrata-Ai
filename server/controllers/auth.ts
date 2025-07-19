import { Request, Response } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { insertUserSchema } from '@shared/schema';
import { hashPassword, comparePassword } from '../utils/bcrypt';
import { generateToken } from '../utils/jwt';
import { AuthRequest } from '../middleware/auth';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = insertUserSchema.extend({
  password: z.string().min(6),
});

export async function register(req: Request, res: Response) {
  try {
    const body = registerSchema.parse(req.body);
    
    // Check if user already exists
    const existingUser = await storage.getUserByEmail(body.email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const hashedPassword = await hashPassword(body.password);
    
    // Create user
    const user = await storage.createUser({
      ...body,
      password: hashedPassword,
    });

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      type: user.type,
    });

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        type: user.type,
        city: user.city,
        premium: user.premium,
        destaque: user.destaque,
      },
      token,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = loginSchema.parse(req.body);
    
    // Find user
    const user = await storage.getUserByEmail(email);
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      type: user.type,
    });

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        type: user.type,
        city: user.city,
        premium: user.premium,
        destaque: user.destaque,
      },
      token,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function getProfile(req: AuthRequest, res: Response) {
  try {
    const user = await storage.getUser(req.user!.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      type: user.type,
      city: user.city,
      premium: user.premium,
      destaque: user.destaque,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function syncClerkUser(req: Request, res: Response) {
  try {
    const { name, email, type, city, clerkId } = req.body;

    console.log('Received sync request:', { name, email, type, city, clerkId });

    if (!name || !email || !type || !clerkId) {
      console.log('Missing fields:', { name: !!name, email: !!email, type: !!type, clerkId: !!clerkId });
      return res.status(400).json({ 
        message: "Missing required fields", 
        received: { name: !!name, email: !!email, type: !!type, clerkId: !!clerkId }
      });
    }

    // Check if user already exists by email
    let existingUser;
    try {
      existingUser = await storage.getUserByEmail(email);
    } catch (error) {
      // User doesn't exist, which is fine
    }

    let user;
    if (existingUser) {
      // Update existing user with Clerk ID if not already set
      user = await storage.updateUser(existingUser.id, {
        clerkId: clerkId,
        name: name,
        type: type
      });
    } else {
      // Create new user
      user = await storage.createUser({
        name,
        email,
        type,
        city: city || 'São Paulo',
        clerkId,
        premium: false,
        destaque: false,
        password: '' // Not needed for Clerk users
      });
    }

    // Generate JWT token for our system
    const token = generateToken({
      userId: user.id,
      email: user.email,
      type: user.type,
    });

    res.json({ 
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        type: user.type,
        city: user.city,
        premium: user.premium,
        destaque: user.destaque,
      }, 
      token 
    });
  } catch (error) {
    console.error('Error syncing Clerk user:', error);
    res.status(500).json({ message: "Internal server error" });
  }
}
