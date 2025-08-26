import { Request, Response } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { insertApplicationSchema } from '@shared/schema';
import { AuthRequest } from '../middleware/auth';

const createApplicationSchema = insertApplicationSchema.omit({
  freelancerId: true,
  createdAt: true,
  updatedAt: true,
});

const updateApplicationSchema = z.object({
  status: z.enum(['pending', 'accepted', 'rejected']),
});

export async function getApplicationsByJob(req: AuthRequest, res: Response) {
  try {
    const { jobId } = req.params;
    
    // Check if job exists and belongs to user
    const job = await storage.getJobById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.clientId !== req.user!.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const applications = await storage.getApplicationsByJob(jobId);
    res.json(applications);
  } catch (error) {
    console.error('Get applications by job error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function getMyApplications(req: AuthRequest, res: Response) {
  try {
    const applications = await storage.getApplicationsByFreelancer(req.user!.userId);
    res.json(applications);
  } catch (error) {
    console.error('Get my applications error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function createApplication(req: AuthRequest, res: Response) {
  try {
    const { jobId, proposedPrice, proposalDescription } = createApplicationSchema.parse(req.body);
    const freelancerId = req.user!.userId;
    
    // Check if job exists
    const job = await storage.getJobById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if user is not the job owner
    if (job.clientId === freelancerId) {
      return res.status(400).json({ message: 'Cannot apply to your own job' });
    }

    // Check if already applied
    const existingApplication = await storage.getApplicationByJobAndFreelancer(jobId, freelancerId);
    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied to this job' });
    }

    const application = await storage.createApplication({
      jobId,
      freelancerId,
      proposedPrice,
      proposalDescription,
    });

    res.status(201).json({ message: 'Application submitted successfully', application });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    console.error('Create application error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function updateApplicationStatus(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { status } = updateApplicationSchema.parse(req.body);
    
    const application = await storage.updateApplicationStatus(id, status);
    res.json({ message: 'Application status updated successfully', application });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    console.error('Update application status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
