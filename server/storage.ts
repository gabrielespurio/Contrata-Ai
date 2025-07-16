import { 
  users, 
  categories, 
  subcategories, 
  jobs, 
  applications, 
  jobLimits,
  type User, 
  type InsertUser,
  type Category,
  type InsertCategory,
  type Subcategory,
  type InsertSubcategory,
  type Job,
  type InsertJob,
  type Application,
  type InsertApplication,
  type JobLimit,
  type InsertJobLimit
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;

  // Category operations
  getCategories(): Promise<Category[]>;
  getSubcategories(): Promise<Subcategory[]>;
  getSubcategoriesByCategory(categoryId: string): Promise<Subcategory[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  createSubcategory(subcategory: InsertSubcategory): Promise<Subcategory>;

  // Job operations
  getJobs(filters?: { city?: string; categoryId?: string; subcategoryId?: string; date?: string }): Promise<(Job & { client: User; subcategory: Subcategory & { category: Category } })[]>;
  getJobById(id: string): Promise<(Job & { client: User; subcategory: Subcategory & { category: Category } }) | undefined>;
  getJobsByClient(clientId: string): Promise<(Job & { subcategory: Subcategory & { category: Category } })[]>;
  createJob(job: InsertJob): Promise<Job>;
  updateJob(id: string, updates: Partial<Job>): Promise<Job>;
  deleteJob(id: string): Promise<void>;

  // Application operations
  getApplicationsByJob(jobId: string): Promise<(Application & { freelancer: User })[]>;
  getApplicationsByFreelancer(freelancerId: string): Promise<(Application & { job: Job & { client: User; subcategory: Subcategory & { category: Category } } })[]>;
  createApplication(application: InsertApplication): Promise<Application>;
  updateApplicationStatus(id: string, status: "pending" | "accepted" | "rejected"): Promise<Application>;
  getApplicationByJobAndFreelancer(jobId: string, freelancerId: string): Promise<Application | undefined>;

  // Job limits
  getJobLimitForWeek(userId: string, weekNumber: number): Promise<JobLimit | undefined>;
  createOrUpdateJobLimit(limit: InsertJobLimit): Promise<JobLimit>;
  getCurrentWeekNumber(): number;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(asc(categories.name));
  }

  async getSubcategories(): Promise<Subcategory[]> {
    return await db.select().from(subcategories).orderBy(asc(subcategories.name));
  }

  async getSubcategoriesByCategory(categoryId: string): Promise<Subcategory[]> {
    return await db
      .select()
      .from(subcategories)
      .where(eq(subcategories.categoryId, categoryId))
      .orderBy(asc(subcategories.name));
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [result] = await db
      .insert(categories)
      .values(category)
      .returning();
    return result;
  }

  async createSubcategory(subcategory: InsertSubcategory): Promise<Subcategory> {
    const [result] = await db
      .insert(subcategories)
      .values(subcategory)
      .returning();
    return result;
  }

  async getJobs(filters?: { city?: string; categoryId?: string; subcategoryId?: string; date?: string }): Promise<(Job & { client: User; subcategory: Subcategory & { category: Category } })[]> {
    const query = db
      .select({
        id: jobs.id,
        clientId: jobs.clientId,
        subcategoryId: jobs.subcategoryId,
        title: jobs.title,
        description: jobs.description,
        date: jobs.date,
        time: jobs.time,
        location: jobs.location,
        payment: jobs.payment,
        destaque: jobs.destaque,
        createdAt: jobs.createdAt,
        client: users,
        subcategory: {
          id: subcategories.id,
          name: subcategories.name,
          categoryId: subcategories.categoryId,
          category: categories,
        },
      })
      .from(jobs)
      .leftJoin(users, eq(jobs.clientId, users.id))
      .leftJoin(subcategories, eq(jobs.subcategoryId, subcategories.id))
      .leftJoin(categories, eq(subcategories.categoryId, categories.id))
      .orderBy(desc(jobs.destaque), desc(jobs.createdAt));

    if (filters?.city) {
      query.where(sql`${users.city} = ${filters.city}`);
    }

    if (filters?.categoryId) {
      query.where(eq(categories.id, filters.categoryId));
    }

    if (filters?.subcategoryId) {
      query.where(eq(subcategories.id, filters.subcategoryId));
    }

    if (filters?.date) {
      query.where(eq(jobs.date, filters.date));
    }

    const result = await query;
    return result as (Job & { client: User; subcategory: Subcategory & { category: Category } })[];
  }

  async getJobById(id: string): Promise<(Job & { client: User; subcategory: Subcategory & { category: Category } }) | undefined> {
    const [result] = await db
      .select({
        id: jobs.id,
        clientId: jobs.clientId,
        subcategoryId: jobs.subcategoryId,
        title: jobs.title,
        description: jobs.description,
        date: jobs.date,
        time: jobs.time,
        location: jobs.location,
        payment: jobs.payment,
        destaque: jobs.destaque,
        createdAt: jobs.createdAt,
        client: users,
        subcategory: {
          id: subcategories.id,
          name: subcategories.name,
          categoryId: subcategories.categoryId,
          category: categories,
        },
      })
      .from(jobs)
      .leftJoin(users, eq(jobs.clientId, users.id))
      .leftJoin(subcategories, eq(jobs.subcategoryId, subcategories.id))
      .leftJoin(categories, eq(subcategories.categoryId, categories.id))
      .where(eq(jobs.id, id));

    return result as (Job & { client: User; subcategory: Subcategory & { category: Category } }) | undefined;
  }

  async getJobsByClient(clientId: string): Promise<(Job & { subcategory: Subcategory & { category: Category } })[]> {
    const result = await db
      .select({
        id: jobs.id,
        clientId: jobs.clientId,
        subcategoryId: jobs.subcategoryId,
        title: jobs.title,
        description: jobs.description,
        date: jobs.date,
        time: jobs.time,
        location: jobs.location,
        payment: jobs.payment,
        destaque: jobs.destaque,
        createdAt: jobs.createdAt,
        subcategory: {
          id: subcategories.id,
          name: subcategories.name,
          categoryId: subcategories.categoryId,
          category: categories,
        },
      })
      .from(jobs)
      .leftJoin(subcategories, eq(jobs.subcategoryId, subcategories.id))
      .leftJoin(categories, eq(subcategories.categoryId, categories.id))
      .where(eq(jobs.clientId, clientId))
      .orderBy(desc(jobs.createdAt));

    return result as (Job & { subcategory: Subcategory & { category: Category } })[];
  }

  async createJob(job: InsertJob): Promise<Job> {
    const [result] = await db
      .insert(jobs)
      .values(job)
      .returning();
    return result;
  }

  async updateJob(id: string, updates: Partial<Job>): Promise<Job> {
    const [result] = await db
      .update(jobs)
      .set(updates)
      .where(eq(jobs.id, id))
      .returning();
    return result;
  }

  async deleteJob(id: string): Promise<void> {
    await db.delete(jobs).where(eq(jobs.id, id));
  }

  async getApplicationsByJob(jobId: string): Promise<(Application & { freelancer: User })[]> {
    const result = await db
      .select({
        id: applications.id,
        jobId: applications.jobId,
        freelancerId: applications.freelancerId,
        status: applications.status,
        createdAt: applications.createdAt,
        freelancer: users,
      })
      .from(applications)
      .leftJoin(users, eq(applications.freelancerId, users.id))
      .where(eq(applications.jobId, jobId))
      .orderBy(desc(applications.createdAt));

    return result as (Application & { freelancer: User })[];
  }

  async getApplicationsByFreelancer(freelancerId: string): Promise<(Application & { job: Job & { client: User; subcategory: Subcategory & { category: Category } } })[]> {
    const result = await db
      .select({
        id: applications.id,
        jobId: applications.jobId,
        freelancerId: applications.freelancerId,
        status: applications.status,
        createdAt: applications.createdAt,
        job: {
          id: jobs.id,
          clientId: jobs.clientId,
          subcategoryId: jobs.subcategoryId,
          title: jobs.title,
          description: jobs.description,
          date: jobs.date,
          time: jobs.time,
          location: jobs.location,
          payment: jobs.payment,
          destaque: jobs.destaque,
          createdAt: jobs.createdAt,
          client: users,
          subcategory: {
            id: subcategories.id,
            name: subcategories.name,
            categoryId: subcategories.categoryId,
            category: categories,
          },
        },
      })
      .from(applications)
      .leftJoin(jobs, eq(applications.jobId, jobs.id))
      .leftJoin(users, eq(jobs.clientId, users.id))
      .leftJoin(subcategories, eq(jobs.subcategoryId, subcategories.id))
      .leftJoin(categories, eq(subcategories.categoryId, categories.id))
      .where(eq(applications.freelancerId, freelancerId))
      .orderBy(desc(applications.createdAt));

    return result as (Application & { job: Job & { client: User; subcategory: Subcategory & { category: Category } } })[];
  }

  async createApplication(application: InsertApplication): Promise<Application> {
    const [result] = await db
      .insert(applications)
      .values(application)
      .returning();
    return result;
  }

  async updateApplicationStatus(id: string, status: "pending" | "accepted" | "rejected"): Promise<Application> {
    const [result] = await db
      .update(applications)
      .set({ status })
      .where(eq(applications.id, id))
      .returning();
    return result;
  }

  async getApplicationByJobAndFreelancer(jobId: string, freelancerId: string): Promise<Application | undefined> {
    const [result] = await db
      .select()
      .from(applications)
      .where(and(eq(applications.jobId, jobId), eq(applications.freelancerId, freelancerId)));
    return result || undefined;
  }

  async getJobLimitForWeek(userId: string, weekNumber: number): Promise<JobLimit | undefined> {
    const [result] = await db
      .select()
      .from(jobLimits)
      .where(and(eq(jobLimits.userId, userId), eq(jobLimits.weekNumber, weekNumber)));
    return result || undefined;
  }

  async createOrUpdateJobLimit(limit: InsertJobLimit): Promise<JobLimit> {
    const existing = await this.getJobLimitForWeek(limit.userId, limit.weekNumber);
    
    if (existing) {
      const [result] = await db
        .update(jobLimits)
        .set({ jobCount: (existing.jobCount || 0) + 1 })
        .where(and(eq(jobLimits.userId, limit.userId), eq(jobLimits.weekNumber, limit.weekNumber)))
        .returning();
      return result;
    } else {
      const [result] = await db
        .insert(jobLimits)
        .values({ ...limit, jobCount: 1 })
        .returning();
      return result;
    }
  }

  getCurrentWeekNumber(): number {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now.getTime() - start.getTime();
    const oneWeek = 1000 * 60 * 60 * 24 * 7;
    return Math.ceil(diff / oneWeek);
  }
}

export const storage = new DatabaseStorage();
