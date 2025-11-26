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
  getNotifications,
  markNotificationAsRead
} from "./controllers/notifications";
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

  // Notification routes
  app.get('/api/notifications', authenticateToken, getNotifications);
  app.patch('/api/notifications/:id/read', authenticateToken, markNotificationAsRead);

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

    // 1. Eventos
    const eventosCategory = await storage.createCategory({ name: 'Eventos' });
    await storage.createSubcategory({ name: 'Garçom / Garçonete', categoryId: eventosCategory.id });
    await storage.createSubcategory({ name: 'Barman', categoryId: eventosCategory.id });
    await storage.createSubcategory({ name: 'Cozinheiro para eventos', categoryId: eventosCategory.id });
    await storage.createSubcategory({ name: 'Copeira', categoryId: eventosCategory.id });
    await storage.createSubcategory({ name: 'Churrasqueiro', categoryId: eventosCategory.id });
    await storage.createSubcategory({ name: 'Auxiliar de eventos', categoryId: eventosCategory.id });
    await storage.createSubcategory({ name: 'Recepcionista de eventos', categoryId: eventosCategory.id });
    await storage.createSubcategory({ name: 'Montador de estrutura', categoryId: eventosCategory.id });
    await storage.createSubcategory({ name: 'DJ', categoryId: eventosCategory.id });
    await storage.createSubcategory({ name: 'Assessor de eventos', categoryId: eventosCategory.id });
    await storage.createSubcategory({ name: 'Fotógrafo', categoryId: eventosCategory.id });
    await storage.createSubcategory({ name: 'Filmagem / Videomaker', categoryId: eventosCategory.id });
    await storage.createSubcategory({ name: 'Segurança', categoryId: eventosCategory.id });
    await storage.createSubcategory({ name: 'Decoração', categoryId: eventosCategory.id });
    await storage.createSubcategory({ name: 'Florista', categoryId: eventosCategory.id });

    // 2. Gastronomia
    const gastronomiaCategory = await storage.createCategory({ name: 'Gastronomia' });
    await storage.createSubcategory({ name: 'Cozinheiro (restaurante)', categoryId: gastronomiaCategory.id });
    await storage.createSubcategory({ name: 'Auxiliar de cozinha', categoryId: gastronomiaCategory.id });
    await storage.createSubcategory({ name: 'Pizzaiolo', categoryId: gastronomiaCategory.id });
    await storage.createSubcategory({ name: 'Chapeiro', categoryId: gastronomiaCategory.id });
    await storage.createSubcategory({ name: 'Confeiteiro', categoryId: gastronomiaCategory.id });
    await storage.createSubcategory({ name: 'Atendente de balcão', categoryId: gastronomiaCategory.id });
    await storage.createSubcategory({ name: 'Repositor de alimentos', categoryId: gastronomiaCategory.id });
    await storage.createSubcategory({ name: 'Entregador interno', categoryId: gastronomiaCategory.id });

    // 3. Serviços Gerais
    const servicosGeraisCategory = await storage.createCategory({ name: 'Serviços Gerais' });
    await storage.createSubcategory({ name: 'Ajudante geral', categoryId: servicosGeraisCategory.id });
    await storage.createSubcategory({ name: 'Porteiro', categoryId: servicosGeraisCategory.id });
    await storage.createSubcategory({ name: 'Zelador', categoryId: servicosGeraisCategory.id });
    await storage.createSubcategory({ name: 'Controlador de acesso', categoryId: servicosGeraisCategory.id });
    await storage.createSubcategory({ name: 'Auxiliar de depósito', categoryId: servicosGeraisCategory.id });
    await storage.createSubcategory({ name: 'Auxiliar de produção', categoryId: servicosGeraisCategory.id });
    await storage.createSubcategory({ name: 'Repositor de estoque', categoryId: servicosGeraisCategory.id });

    // 4. Construção & Reparos
    const construcaoCategory = await storage.createCategory({ name: 'Construção & Reparos' });
    await storage.createSubcategory({ name: 'Pedreiro', categoryId: construcaoCategory.id });
    await storage.createSubcategory({ name: 'Pintor', categoryId: construcaoCategory.id });
    await storage.createSubcategory({ name: 'Encanador', categoryId: construcaoCategory.id });
    await storage.createSubcategory({ name: 'Eletricista', categoryId: construcaoCategory.id });
    await storage.createSubcategory({ name: 'Mestre de obras', categoryId: construcaoCategory.id });
    await storage.createSubcategory({ name: 'Gesseiro', categoryId: construcaoCategory.id });
    await storage.createSubcategory({ name: 'Azulejista', categoryId: construcaoCategory.id });
    await storage.createSubcategory({ name: 'Carpinteiro', categoryId: construcaoCategory.id });
    await storage.createSubcategory({ name: 'Marceneiro', categoryId: construcaoCategory.id });
    await storage.createSubcategory({ name: 'Montador de móveis', categoryId: construcaoCategory.id });
    await storage.createSubcategory({ name: 'Serralheiro', categoryId: construcaoCategory.id });

    // 5. Automotivo & Mecânica
    const automotivoCategory = await storage.createCategory({ name: 'Automotivo & Mecânica' });
    await storage.createSubcategory({ name: 'Mecânico', categoryId: automotivoCategory.id });
    await storage.createSubcategory({ name: 'Borracheiro', categoryId: automotivoCategory.id });
    await storage.createSubcategory({ name: 'Guincho', categoryId: automotivoCategory.id });
    await storage.createSubcategory({ name: 'Funileiro', categoryId: automotivoCategory.id });
    await storage.createSubcategory({ name: 'Polidor', categoryId: automotivoCategory.id });
    await storage.createSubcategory({ name: 'Lavador automotivo', categoryId: automotivoCategory.id });
    await storage.createSubcategory({ name: 'Eletricista automotivo', categoryId: automotivoCategory.id });

    // 6. Limpeza
    const limpezaCategory = await storage.createCategory({ name: 'Limpeza' });
    await storage.createSubcategory({ name: 'Diarista', categoryId: limpezaCategory.id });
    await storage.createSubcategory({ name: 'Faxineiro', categoryId: limpezaCategory.id });
    await storage.createSubcategory({ name: 'Limpeza pós-obra', categoryId: limpezaCategory.id });
    await storage.createSubcategory({ name: 'Limpeza comercial', categoryId: limpezaCategory.id });
    await storage.createSubcategory({ name: 'Jardinagem', categoryId: limpezaCategory.id });
    await storage.createSubcategory({ name: 'Piscineiro', categoryId: limpezaCategory.id });

    // 7. Saúde e Bem-estar
    const saudeCategory = await storage.createCategory({ name: 'Saúde e Bem-estar' });
    await storage.createSubcategory({ name: 'Cuidador de idosos', categoryId: saudeCategory.id });
    await storage.createSubcategory({ name: 'Cuidador infantil / Babá', categoryId: saudeCategory.id });
    await storage.createSubcategory({ name: 'Massagista', categoryId: saudeCategory.id });
    await storage.createSubcategory({ name: 'Técnico de enfermagem domiciliar', categoryId: saudeCategory.id });
    await storage.createSubcategory({ name: 'Auxiliar de saúde', categoryId: saudeCategory.id });

    // 8. Beleza & Cuidados Pessoais
    const belezaCategory = await storage.createCategory({ name: 'Beleza & Cuidados Pessoais' });
    await storage.createSubcategory({ name: 'Cabeleireiro', categoryId: belezaCategory.id });
    await storage.createSubcategory({ name: 'Manicure / Pedicure', categoryId: belezaCategory.id });
    await storage.createSubcategory({ name: 'Maquiador', categoryId: belezaCategory.id });
    await storage.createSubcategory({ name: 'Depiladora', categoryId: belezaCategory.id });
    await storage.createSubcategory({ name: 'Designer de sobrancelhas', categoryId: belezaCategory.id });
    await storage.createSubcategory({ name: 'Barbeiro', categoryId: belezaCategory.id });
    await storage.createSubcategory({ name: 'Esteticista', categoryId: belezaCategory.id });

    // 9. Logística & Transporte
    const logisticaCategory = await storage.createCategory({ name: 'Logística & Transporte' });
    await storage.createSubcategory({ name: 'Motoboy', categoryId: logisticaCategory.id });
    await storage.createSubcategory({ name: 'Entregador', categoryId: logisticaCategory.id });
    await storage.createSubcategory({ name: 'Motorista de aplicativo', categoryId: logisticaCategory.id });
    await storage.createSubcategory({ name: 'Motorista particular', categoryId: logisticaCategory.id });
    await storage.createSubcategory({ name: 'Motorista de carga leve', categoryId: logisticaCategory.id });

    // 10. Administração & Atendimento
    const administracaoCategory = await storage.createCategory({ name: 'Administração & Atendimento' });
    await storage.createSubcategory({ name: 'Atendente presencial', categoryId: administracaoCategory.id });
    await storage.createSubcategory({ name: 'Recepcionista', categoryId: administracaoCategory.id });
    await storage.createSubcategory({ name: 'Auxiliar administrativo', categoryId: administracaoCategory.id });
    await storage.createSubcategory({ name: 'Caixa', categoryId: administracaoCategory.id });
    await storage.createSubcategory({ name: 'Vendedor presencial', categoryId: administracaoCategory.id });

    // 11. Aulas
    const aulasCategory = await storage.createCategory({ name: 'Aulas' });
    await storage.createSubcategory({ name: 'Aulas de reforço escolar', categoryId: aulasCategory.id });
    await storage.createSubcategory({ name: 'Aulas de música', categoryId: aulasCategory.id });
    await storage.createSubcategory({ name: 'Aulas de idiomas', categoryId: aulasCategory.id });
    await storage.createSubcategory({ name: 'Aulas de dança', categoryId: aulasCategory.id });
    await storage.createSubcategory({ name: 'Personal trainer', categoryId: aulasCategory.id });
    await storage.createSubcategory({ name: 'Treinador esportivo', categoryId: aulasCategory.id });

    console.log('Database seeded successfully with 11 categories and all subcategories');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}
