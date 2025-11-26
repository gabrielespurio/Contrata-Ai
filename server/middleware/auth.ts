import { Request, Response, NextFunction, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'contrata-ai-secret-key-2025';

export interface AuthUser {
  userId: string;
  email: string;
  type: 'freelancer' | 'contratante';
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token not provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      type: decoded.type
    };
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export function requireUserType(userType: 'freelancer' | 'contratante') {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (req.user.type !== userType) {
      return res.status(403).json({ 
        error: `Access denied. Required user type: ${userType}` 
      });
    }

    next();
  };
}

export function generateToken(userId: string, email: string, type: 'freelancer' | 'contratante') {
  return jwt.sign(
    { userId, email, type },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}