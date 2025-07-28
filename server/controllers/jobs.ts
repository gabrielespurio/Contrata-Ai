import { Request, Response } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { insertJobSchema } from '@shared/schema';
import { AuthRequest } from '../middleware/auth';

const createJobSchema = insertJobSchema.extend({
  payment: z.string().transform((val) => val),
  destaque: z.boolean().optional(),
  // Novos campos para múltiplos horários
  schedules: z.array(z.object({
    day: z.string(),
    dayName: z.string(),
    startTime: z.string(),
    endTime: z.string(),
  })).optional(),
}).refine((data) => {
  // Valida que pelo menos um tipo de agendamento foi preenchido
  const hasSimpleSchedule = data.date && data.time;
  const hasMultipleSchedules = data.schedules && data.schedules.length > 0;
  return hasSimpleSchedule || hasMultipleSchedules;
}, {
  message: 'É necessário definir pelo menos um horário (data/hora simples ou múltiplos dias)',
});

const jobFiltersSchema = z.object({
  city: z.string().optional(),
  categoryId: z.string().optional(),
  subcategoryId: z.string().optional(),
  date: z.string().optional(),
});

export async function getJobs(req: Request, res: Response) {
  try {
    const filters = jobFiltersSchema.parse(req.query);
    const jobs = await storage.getJobs(filters);
    
    res.json(jobs);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    console.error('Get jobs error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function getJobById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const job = await storage.getJobById(id);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json(job);
  } catch (error) {
    console.error('Get job by ID error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function getMyJobs(req: AuthRequest, res: Response) {
  try {
    const jobs = await storage.getJobsByClient(req.user!.userId);
    res.json(jobs);
  } catch (error) {
    console.error('Get my jobs error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function createJob(req: AuthRequest, res: Response) {
  try {
    const body = createJobSchema.parse(req.body);
    const userId = req.user!.userId;
    
    // Get user to check if premium
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check job limits for non-premium users
    if (!user.premium) {
      const currentWeek = storage.getCurrentWeekNumber();
      const jobLimit = await storage.getJobLimitForWeek(userId, currentWeek);
      
      if (jobLimit && (jobLimit.jobCount || 0) >= 3) {
        return res.status(400).json({ 
          message: 'Weekly job limit reached. Upgrade to premium for unlimited jobs.' 
        });
      }
    }

    // Prepare job data (temporariamente sem schedules até o banco ser atualizado)
    const { schedules, ...jobDataWithoutSchedules } = body;
    const jobData = {
      ...jobDataWithoutSchedules,
      clientId: userId,
    };

    // Create job
    const job = await storage.createJob(jobData);

    // Update job count for non-premium users
    if (!user.premium) {
      const currentWeek = storage.getCurrentWeekNumber();
      await storage.createOrUpdateJobLimit({
        userId,
        weekNumber: currentWeek,
        jobCount: 0, // This will be incremented in the storage method
      });
    }

    res.status(201).json({ message: 'Job created successfully', job });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    console.error('Create job error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function updateJob(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Check if job exists and belongs to user
    const job = await storage.getJobById(id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.clientId !== req.user!.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedJob = await storage.updateJob(id, updates);
    res.json({ message: 'Job updated successfully', job: updatedJob });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function deleteJob(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    
    // Check if job exists and belongs to user
    const job = await storage.getJobById(id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.clientId !== req.user!.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await storage.deleteJob(id);
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function getCategories(req: Request, res: Response) {
  try {
    const categories = await storage.getCategories();
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function getSubcategories(req: Request, res: Response) {
  try {
    const { categoryId } = req.query;
    
    if (categoryId) {
      const subcategories = await storage.getSubcategoriesByCategory(categoryId as string);
      res.json(subcategories);
    } else {
      const subcategories = await storage.getSubcategories();
      res.json(subcategories);
    }
  } catch (error) {
    console.error('Get subcategories error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
