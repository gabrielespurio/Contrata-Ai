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
    
    // Prepare user data based on userType and profile information
    const userDataToSave: any = {
      clerkId: userId,
      email: clerkUser.emailAddresses[0]?.emailAddress || '',
      type: userType as 'freelancer' | 'contratante',
      city: userData?.city || userData?.address?.city || 'São Paulo'
    };

    if (userType === 'freelancer') {
      userDataToSave.name = userData?.name || clerkUser.firstName || 'Freelancer';
      userDataToSave.phone = userData?.phone || '';
    } else if (userType === 'contratante') {
      if (userData?.personType === 'individual') {
        userDataToSave.name = userData?.fullName || userData?.name || clerkUser.firstName || 'Contratante';
        userDataToSave.cpf = userData?.cpf || '';
        userDataToSave.phone = userData?.phone || '';
      } else if (userData?.personType === 'empresa') {
        userDataToSave.name = userData?.companyName || 'Empresa';
        userDataToSave.cnpj = userData?.cnpj || '';
        userDataToSave.responsibleName = userData?.responsibleName || '';
        userDataToSave.phone = userData?.phone || '';
      }
    }
    
    if (!user) {
      // Create new user in our database
      user = await storage.createUser(userDataToSave);
    } else {
      // Update existing user
      await storage.updateUser(user.id, userDataToSave);
      user = await storage.getUserByClerkId(userId); // Get updated user
    }

    // Update Clerk user's public metadata
    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        userType: userType,
        city: userDataToSave.city,
        databaseSynced: true,
        premium: false
      }
    });

    if (!user) {
      return res.status(500).json({ error: 'Failed to create or update user' });
    }

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