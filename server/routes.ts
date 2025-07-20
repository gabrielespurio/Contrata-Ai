import type { Express } from "express";
import { createServer, type Server } from "http";
import { authenticateClerk, requireUserType } from "./middleware/clerkAuth";
import { syncClerkUser, getClerkProfile } from "./controllers/clerkAuth";
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
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Seed initial data
  await seedDatabase();

  // Auth routes
  app.post('/api/auth/sync-clerk-user', syncClerkUser);
  app.get('/api/auth/profile', authenticateClerk, getClerkProfile);

  // Job routes
  app.get('/api/jobs', getJobs);
  app.get('/api/jobs/:id', getJobById);
  app.get('/api/jobs/my/jobs', authenticateClerk, requireUserType('contratante'), getMyJobs);
  app.post('/api/jobs', authenticateClerk, requireUserType('contratante'), createJob);
  app.patch('/api/jobs/:id', authenticateClerk, requireUserType('contratante'), updateJob);
  app.delete('/api/jobs/:id', authenticateClerk, requireUserType('contratante'), deleteJob);

  // Category routes
  app.get('/api/categories', getCategories);
  app.get('/api/subcategories', getSubcategories);

  // Application routes
  app.get('/api/applications/job/:jobId', authenticateClerk, requireUserType('contratante'), getApplicationsByJob);
  app.get('/api/applications/my', authenticateClerk, requireUserType('freelancer'), getMyApplications);
  app.post('/api/applications', authenticateClerk, requireUserType('freelancer'), createApplication);
  app.patch('/api/applications/:id/status', authenticateClerk, requireUserType('contratante'), updateApplicationStatus);

  // User routes
  app.patch('/api/users/profile', authenticateClerk, updateProfile);
  app.post('/api/users/upgrade', authenticateClerk, upgradeToPremium);
  app.post('/api/users/highlight', authenticateClerk, purchaseHighlight);
  app.get('/api/users/stats', authenticateClerk, getStats);

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
