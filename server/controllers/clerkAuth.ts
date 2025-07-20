import { Request, Response } from 'express';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { storage } from '../storage';

export async function syncClerkUser(req: Request, res: Response) {
  try {
    const { userId, userType, userData } = req.body;

    if (!userId || !userType) {
      return res.status(400).json({ 
        error: 'userId and userType are required' 
      });
    }

    // Get user from Clerk to verify
    const clerkUser = await clerkClient.users.getUser(userId);
    
    if (!clerkUser) {
      return res.status(404).json({ error: 'User not found in Clerk' });
    }

    // Check if user already exists in our database
    let user = await storage.getUserByClerkId(userId);
    
    if (!user) {
      // Create new user in our database
      const newUser = {
        clerkId: userId,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        name: userData?.name || clerkUser.firstName || '',
        type: userType as 'freelancer' | 'contratante',
        city: userData?.city || '',
      };
      
      user = await storage.createUser(newUser);
    }

    // Update Clerk user's public metadata
    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        userType: userType,
        databaseSynced: true
      }
    });

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        userType: user.type,
        needsOnboarding: false
      }
    });
  } catch (error) {
    console.error('Error syncing Clerk user:', error);
    res.status(500).json({ error: 'Failed to sync user data' });
  }
}

export async function getClerkProfile(req: Request, res: Response) {
  try {
    const userId = req.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Get user from our database
    const user = await storage.getUserByClerkId(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found in database' });
    }

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      userType: user.type,
      city: user.city,
      premium: user.premium
    });
  } catch (error) {
    console.error('Error getting profile:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
}