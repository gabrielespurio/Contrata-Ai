import { Request, Response } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { AuthRequest } from '../middleware/auth';

const updateUserSchema = z.object({
  name: z.string().optional(),
  city: z.string().optional(),
  premium: z.boolean().optional(),
  destaque: z.boolean().optional(),
});

const upgradeSchema = z.object({
  plan: z.enum(['premium']),
});

const highlightSchema = z.object({
  type: z.enum(['job', 'profile']),
  targetId: z.string().optional(), // For job highlighting
});

export async function updateProfile(req: AuthRequest, res: Response) {
  try {
    const updates = updateUserSchema.parse(req.body);
    const userId = req.user!.userId;
    
    const user = await storage.updateUser(userId, updates);
    
    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        type: user.type,
        city: user.city,
        premium: user.premium,
        destaque: user.destaque,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function upgradeToPremium(req: AuthRequest, res: Response) {
  try {
    const { plan } = upgradeSchema.parse(req.body);
    const userId = req.user!.userId;
    
    if (plan === 'premium') {
      const user = await storage.updateUser(userId, { premium: true });
      res.json({
        message: 'Successfully upgraded to premium plan',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          type: user.type,
          city: user.city,
          premium: user.premium,
          destaque: user.destaque,
        },
      });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    console.error('Upgrade to premium error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function purchaseHighlight(req: AuthRequest, res: Response) {
  try {
    const { type, targetId } = highlightSchema.parse(req.body);
    const userId = req.user!.userId;
    
    if (type === 'profile') {
      const user = await storage.updateUser(userId, { destaque: true });
      res.json({
        message: 'Profile highlighted successfully for 7 days',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          type: user.type,
          city: user.city,
          premium: user.premium,
          destaque: user.destaque,
        },
      });
    } else if (type === 'job' && targetId) {
      // Check if job belongs to user
      const job = await storage.getJobById(targetId);
      if (!job) {
        return res.status(404).json({ message: 'Job not found' });
      }
      
      if (job.clientId !== userId) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      const updatedJob = await storage.updateJob(targetId, { destaque: true });
      res.json({
        message: 'Job highlighted successfully for 7 days',
        job: updatedJob,
      });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    console.error('Purchase highlight error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function getStats(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const userType = req.user!.type;
    
    if (userType === 'contratante') {
      const jobs = await storage.getJobsByClient(userId);
      const activeJobs = jobs.length;
      
      // Get total applications count
      let totalApplicants = 0;
      for (const job of jobs) {
        const applications = await storage.getApplicationsByJob(job.id);
        totalApplicants += applications.length;
      }
      
      // Get completed jobs (accepted applications)
      let completedJobs = 0;
      for (const job of jobs) {
        const applications = await storage.getApplicationsByJob(job.id);
        if (applications.some(app => app.status === 'accepted')) {
          completedJobs++;
        }
      }
      
      res.json({
        activeJobs,
        totalApplicants,
        completedJobs,
      });
    } else {
      const applications = await storage.getApplicationsByFreelancer(userId);
      const totalApplications = applications.length;
      const acceptedApplications = applications.filter(app => app.status === 'accepted').length;
      const pendingApplications = applications.filter(app => app.status === 'pending').length;
      
      res.json({
        totalApplications,
        acceptedApplications,
        pendingApplications,
      });
    }
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
