import { Request, Response, NextFunction } from 'express';
import { clerkClient } from '@clerk/clerk-sdk-node';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      user?: {
        id: string;
        email: string;
        userType?: string;
      };
    }
  }
}

export async function authenticateClerk(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Token not provided' });
    }

    // Verify the token with Clerk
    const verifiedToken = await clerkClient.verifyToken(token);
    const userId = (verifiedToken as any).userId || verifiedToken.sub;
    
    if (!userId) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Get user from Clerk
    const clerkUser = await clerkClient.users.getUser(userId);
    
    req.userId = userId;
    req.user = {
      id: userId,
      email: clerkUser.emailAddresses[0]?.emailAddress || '',
      userType: clerkUser.publicMetadata?.userType as string | undefined
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export function requireUserType(userType: 'freelancer' | 'contratante') {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (req.user.userType !== userType) {
      return res.status(403).json({ 
        error: `Access denied. Required user type: ${userType}` 
      });
    }

    next();
  };
}