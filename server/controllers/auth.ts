import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { storage } from '../storage';
import { generateToken } from '../middleware/auth';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const signupSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  type: z.enum(['freelancer', 'contratante']).default('freelancer'),
  city: z.string().default('São Paulo'),
});

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = loginSchema.parse(req.body);
    
    // Find user by email
    const user = await storage.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    // Check password
    if (!user.password) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    // Generate token
    const token = generateToken(user.id, user.email, user.type);

    // Return user data and token
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        type: user.type,
        city: user.city,
        premium: user.premium,
        destaque: user.destaque,
        needsOnboarding: false // For login users, assume onboarding is complete
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Dados inválidos', errors: error.errors });
    }
    console.error('Login error:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
}

export async function signup(req: Request, res: Response) {
  try {
    const { name, email, password, type, city } = signupSchema.parse(req.body);
    
    // Check if user already exists
    const existingUser = await storage.getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: 'Email já está em uso' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await storage.createUser({
      name,
      email,
      password: hashedPassword,
      type,
      city,
      premium: false,
      destaque: false
    });

    // Generate token
    const token = generateToken(user.id, user.email, user.type);

    // Return user data and token
    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        type: user.type,
        city: user.city,
        premium: user.premium,
        destaque: user.destaque,
        needsOnboarding: true // New users need onboarding
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Dados inválidos', errors: error.errors });
    }
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
}

export async function getProfile(req: Request, res: Response) {
  try {
    const authReq = req as any;
    const userId = authReq.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      type: user.type,
      city: user.city,
      premium: user.premium,
      destaque: user.destaque,
      needsOnboarding: false
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
}