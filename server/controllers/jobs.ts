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
  // Campos opcionais para compatibilidade
  date: z.string().optional(),
  time: z.string().optional(),
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
    console.log('🔍 GET MY JOBS - Usuario logado:', req.user);
    console.log('🔍 GET MY JOBS - Buscando vagas para clientId:', req.user!.userId);
    
    const jobs = await storage.getJobsByClient(req.user!.userId);
    
    console.log('🔍 GET MY JOBS - Vagas encontradas:', jobs.length);
    console.log('🔍 GET MY JOBS - IDs das vagas:', jobs.map(j => ({ id: j.id, title: j.title, clientId: j.clientId })));
    
    res.json(jobs);
  } catch (error) {
    console.error('Get my jobs error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function createJob(req: AuthRequest, res: Response) {
  try {
    console.log('🔥 CREATE JOB - dados recebidos:', JSON.stringify(req.body, null, 2));
    console.log('👤 Usuário:', req.user);
    
    const body = createJobSchema.parse(req.body);
    console.log('✅ Dados validados:', JSON.stringify(body, null, 2));
    
    const userId = req.user!.userId;
    
    // Get user to check if premium
    const user = await storage.getUser(userId);
    if (!user) {
      console.log('❌ Usuário não encontrado:', userId);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('👤 Dados do usuário:', user);

    // Check job limits for non-premium users
    if (!user.premium) {
      const currentWeek = storage.getCurrentWeekNumber();
      const jobLimit = await storage.getJobLimitForWeek(userId, currentWeek);
      
      if (jobLimit && (jobLimit.jobCount || 0) >= 3) {
        console.log('❌ Limite semanal atingido');
        return res.status(400).json({ 
          message: 'Weekly job limit reached. Upgrade to premium for unlimited jobs.' 
        });
      }
    }

    // Prepare job data (temporariamente sem schedules até o banco ser atualizado)
    const { schedules, ...jobDataWithoutSchedules } = body;
    
    // Adiciona data e hora padrão se não fornecidas (necessário para campos obrigatórios)
    const currentDate = new Date().toISOString().split('T')[0];
    const defaultTime = '08:00';
    
    const jobData = {
      ...jobDataWithoutSchedules,
      clientId: userId,
      date: body.date || currentDate,
      time: body.time || defaultTime,
    };
    
    console.log('🔧 Data padrão aplicada:', currentDate);
    console.log('🔧 Hora padrão aplicada:', defaultTime);

    console.log('📝 Dados para criação:', JSON.stringify(jobData, null, 2));

    // Create job
    const job = await storage.createJob(jobData);
    console.log('🎉 Vaga criada:', job);

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
      console.log('❌ Erro de validação:', error.errors);
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    console.error('❌ Erro geral:', error);
    res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
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
