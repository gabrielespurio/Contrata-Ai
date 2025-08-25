import type { Express } from "express";
import { createServer, type Server } from "http";
import { authenticateToken, requireUserType } from "./middleware/auth";
import { login, signup, getProfile, completeOnboarding } from "./controllers/auth";
import { 
  getJobs, 
  getJobById, 
  getMyJobs, 
  createJob, 
  updateJob, 
  deleteJob, 
  getCategories, 
  getSubcategories 
} from "./controllers/jobs";
import { 
  getApplicationsByJob, 
  getMyApplications, 
  createApplication, 
  updateApplicationStatus 
} from "./controllers/applications";
import { 
  updateProfile, 
  upgradeToPremium, 
  purchaseHighlight, 
  getStats 
} from "./controllers/users";
import {
  createFreelancerProfile,
  getFreelancerProfile,
  updateFreelancerProfile
} from "./controllers/freelancerProfiles";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Seed initial data
  await seedDatabase();

  // Auth routes
  app.post('/api/auth/login', login);
  app.post('/api/auth/signup', signup);
  app.get('/api/auth/profile', authenticateToken, getProfile);
  app.post('/api/auth/complete-onboarding', authenticateToken, completeOnboarding);

  // Job routes
  app.get('/api/jobs', getJobs);
  app.get('/api/jobs/:id', getJobById);
  app.get('/api/jobs/my/jobs', authenticateToken, requireUserType('contratante'), getMyJobs);
  app.post('/api/jobs', authenticateToken, requireUserType('contratante'), createJob);
  app.patch('/api/jobs/:id', authenticateToken, requireUserType('contratante'), updateJob);
  app.delete('/api/jobs/:id', authenticateToken, requireUserType('contratante'), deleteJob);

  // Category routes
  app.get('/api/categories', getCategories);
  app.get('/api/subcategories', getSubcategories);

  // Skills
  app.get('/api/skills', async (req, res) => {
    try {
      const skills = await storage.getSkills();
      res.json(skills);
    } catch (error) {
      console.error('Error fetching skills:', error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Application routes
  app.get('/api/applications/job/:jobId', authenticateToken, requireUserType('contratante'), getApplicationsByJob);
  app.get('/api/applications/my', authenticateToken, requireUserType('freelancer'), getMyApplications);
  app.post('/api/applications', authenticateToken, requireUserType('freelancer'), createApplication);
  app.patch('/api/applications/:id/status', authenticateToken, requireUserType('contratante'), updateApplicationStatus);

  // User routes
  app.patch('/api/users/profile', authenticateToken, updateProfile);
  app.post('/api/users/upgrade', authenticateToken, upgradeToPremium);
  app.post('/api/users/highlight', authenticateToken, purchaseHighlight);
  app.get('/api/users/stats', authenticateToken, getStats);

  // Freelancer profile routes
  app.post('/api/freelancer-profiles', authenticateToken, requireUserType('freelancer'), createFreelancerProfile);
  app.get('/api/freelancer-profiles', authenticateToken, requireUserType('freelancer'), getFreelancerProfile);
  app.patch('/api/freelancer-profiles', authenticateToken, requireUserType('freelancer'), updateFreelancerProfile);

  const httpServer = createServer(app);
  return httpServer;
}

async function seedDatabase() {
  try {
    // Check if categories already exist
    const existingCategories = await storage.getCategories();
    if (existingCategories.length > 0) {
      return; // Already seeded
    }

    // Seed categories
    const eventosCategory = await storage.createCategory({ name: 'Eventos' });
    const gastronomiaCategory = await storage.createCategory({ name: 'Gastronomia' });
    const limpezaCategory = await storage.createCategory({ name: 'Limpeza' });
    const segurancaCategory = await storage.createCategory({ name: 'Segurança' });
    const hotelariaCategory = await storage.createCategory({ name: 'Hotelaria' });

    // Seed subcategories
    await storage.createSubcategory({ name: 'Garçom', categoryId: eventosCategory.id });
    await storage.createSubcategory({ name: 'Recepcionista', categoryId: eventosCategory.id });
    await storage.createSubcategory({ name: 'Barman', categoryId: eventosCategory.id });
    await storage.createSubcategory({ name: 'DJ', categoryId: eventosCategory.id });
    await storage.createSubcategory({ name: 'Segurança', categoryId: eventosCategory.id });

    await storage.createSubcategory({ name: 'Cozinheiro', categoryId: gastronomiaCategory.id });
    await storage.createSubcategory({ name: 'Ajudante de Cozinha', categoryId: gastronomiaCategory.id });
    await storage.createSubcategory({ name: 'Pizzaiolo', categoryId: gastronomiaCategory.id });
    await storage.createSubcategory({ name: 'Confeiteiro', categoryId: gastronomiaCategory.id });

    await storage.createSubcategory({ name: 'Faxineiro', categoryId: limpezaCategory.id });
    await storage.createSubcategory({ name: 'Limpeza Pós-Evento', categoryId: limpezaCategory.id });
    await storage.createSubcategory({ name: 'Limpeza de Escritório', categoryId: limpezaCategory.id });

    await storage.createSubcategory({ name: 'Porteiro', categoryId: segurancaCategory.id });
    await storage.createSubcategory({ name: 'Vigilante', categoryId: segurancaCategory.id });
    await storage.createSubcategory({ name: 'Segurança de Evento', categoryId: segurancaCategory.id });

    await storage.createSubcategory({ name: 'Recepcionista', categoryId: hotelariaCategory.id });
    await storage.createSubcategory({ name: 'Camareira', categoryId: hotelariaCategory.id });
    await storage.createSubcategory({ name: 'Concierge', categoryId: hotelariaCategory.id });

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}
