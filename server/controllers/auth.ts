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
  type: z.enum(['freelancer', 'contratante']).default('freelancer'), // Temporário, será atualizado no onboarding
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

    // Check if user has completed onboarding by checking if they have a profile
    let needsOnboarding = false; // Default to false - only set true if explicitly needed
    
    try {
      if (user.type === 'freelancer') {
        const profile = await storage.getFreelancerProfile(userId);
        needsOnboarding = !profile;
        console.log(`Profile check for freelancer ${userId}: profile exists = ${!!profile}, needsOnboarding = ${needsOnboarding}`);
      } else if (user.type === 'contratante') {
        // Contractors don't need additional profile
        needsOnboarding = false;
      }
    } catch (error) {
      console.error('Error checking profile completion:', error);
      // If we can't check, don't force onboarding - assume it's complete
      needsOnboarding = false;
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      type: user.type,
      city: user.city,
      premium: user.premium,
      destaque: user.destaque,
      needsOnboarding
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
}

const completeOnboardingSchema = z.object({
  userType: z.enum(['freelancer', 'contratante']),
  name: z.string().optional(),
  city: z.string().optional(),
});

export async function completeOnboarding(req: Request, res: Response) {
  try {
    const authReq = req as any;
    const userId = authReq.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    const { userType, name, city } = completeOnboardingSchema.parse(req.body);
    
    // Atualizar usuário no banco de dados
    const updateData: any = { type: userType };
    if (name) updateData.name = name;
    if (city) updateData.city = city;
    
    const user = await storage.updateUser(userId, updateData);
    
    // Generate a new token with the updated user type
    const token = generateToken(user.id, user.email, user.type);
    
    res.json({
      message: 'Onboarding completed successfully',
      token, // Return new token with updated user type
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        type: user.type,
        city: user.city,
        premium: user.premium,
        destaque: user.destaque,
        needsOnboarding: false
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Dados inválidos', errors: error.errors });
    }
    console.error('Complete onboarding error:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
}