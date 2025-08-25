import { 
  users, 
  categories, 
  subcategories, 
  jobs, 
  applications, 
  jobLimits,
  freelancerProfiles,
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
  type InsertJobLimit,
  type FreelancerProfile,
  type InsertFreelancerProfile
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByClerkId(clerkId: string): Promise<User | undefined>;
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

  // Freelancer profiles
  getFreelancerProfile(userId: string): Promise<FreelancerProfile | undefined>;
  createFreelancerProfile(profile: InsertFreelancerProfile): Promise<FreelancerProfile>;
  updateFreelancerProfile(userId: string, updates: Partial<FreelancerProfile>): Promise<FreelancerProfile>;
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

  async getUserByClerkId(clerkId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.clerkId, clerkId));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values([{
        ...insertUser,
        type: insertUser.type as "freelancer" | "contratante"
      }])
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
    let query = db
      .select()
      .from(jobs)
      .leftJoin(users, eq(jobs.clientId, users.id))
      .leftJoin(subcategories, eq(jobs.subcategoryId, subcategories.id))
      .leftJoin(categories, eq(subcategories.categoryId, categories.id))
      .orderBy(desc(jobs.destaque), desc(jobs.createdAt));

    const result = await query;
    return result.map(row => ({
      ...row.jobs,
      client: row.users!,
      subcategory: {
        ...row.subcategories!,
        category: row.categories!
      }
    }));
  }

  async getJobById(id: string): Promise<(Job & { client: User; subcategory: Subcategory & { category: Category } }) | undefined> {
    const [result] = await db
      .select()
      .from(jobs)
      .leftJoin(users, eq(jobs.clientId, users.id))
      .leftJoin(subcategories, eq(jobs.subcategoryId, subcategories.id))
      .leftJoin(categories, eq(subcategories.categoryId, categories.id))
      .where(eq(jobs.id, id));

    if (!result || !result.users || !result.subcategories || !result.categories) return undefined;

    return {
      ...result.jobs,
      client: result.users,
      subcategory: {
        ...result.subcategories,
        category: result.categories
      }
    };
  }

  async getJobsByClient(clientId: string): Promise<(Job & { subcategory: Subcategory & { category: Category } })[]> {
    const result = await db
      .select()
      .from(jobs)
      .leftJoin(subcategories, eq(jobs.subcategoryId, subcategories.id))
      .leftJoin(categories, eq(subcategories.categoryId, categories.id))
      .where(eq(jobs.clientId, clientId))
      .orderBy(desc(jobs.createdAt));

    return result.map(row => ({
      ...row.jobs,
      subcategory: {
        ...row.subcategories!,
        category: row.categories!
      }
    }));
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
      .select()
      .from(applications)
      .leftJoin(users, eq(applications.freelancerId, users.id))
      .where(eq(applications.jobId, jobId));

    return result.map(row => ({
      ...row.applications,
      freelancer: row.users!
    }));
  }

  async getApplicationsByFreelancer(freelancerId: string): Promise<(Application & { job: Job & { client: User; subcategory: Subcategory & { category: Category } } })[]> {
    const result = await db
      .select()
      .from(applications)
      .leftJoin(jobs, eq(applications.jobId, jobs.id))
      .leftJoin(users, eq(jobs.clientId, users.id))
      .leftJoin(subcategories, eq(jobs.subcategoryId, subcategories.id))
      .leftJoin(categories, eq(subcategories.categoryId, categories.id))
      .where(eq(applications.freelancerId, freelancerId));

    return result.map(row => ({
      ...row.applications,
      job: {
        ...row.jobs!,
        client: row.users!,
        subcategory: {
          ...row.subcategories!,
          category: row.categories!
        }
      }
    }));
  }

  async createApplication(application: InsertApplication): Promise<Application> {
    const [result] = await db
      .insert(applications)
      .values([{
        ...application,
        status: (application.status || "pending") as "pending" | "accepted" | "rejected"
      }])
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
    const existing = await this.getJobLimitForWeek(limit.userId!, limit.weekNumber!);
    
    if (existing) {
      const [result] = await db
        .update(jobLimits)
        .set({ jobCount: limit.jobCount })
        .where(eq(jobLimits.id, existing.id))
        .returning();
      return result;
    } else {
      const [result] = await db
        .insert(jobLimits)
        .values([limit])
        .returning();
      return result;
    }
  }

  getCurrentWeekNumber(): number {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now.getTime() - start.getTime();
    const oneWeek = 1000 * 60 * 60 * 24 * 7;
    return Math.floor(diff / oneWeek);
  }

  async getFreelancerProfile(userId: string): Promise<FreelancerProfile | undefined> {
    const [result] = await db
      .select()
      .from(freelancerProfiles)
      .where(eq(freelancerProfiles.userId, userId));
    return result || undefined;
  }

  async createFreelancerProfile(profile: InsertFreelancerProfile): Promise<FreelancerProfile> {
    const [result] = await db
      .insert(freelancerProfiles)
      .values([{
        ...profile,
        personType: profile.personType as "individual" | "empresa"
      }])
      .returning();
    return result;
  }

  async updateFreelancerProfile(userId: string, updates: Partial<FreelancerProfile>): Promise<FreelancerProfile> {
    const [result] = await db
      .update(freelancerProfiles)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(freelancerProfiles.userId, userId))
      .returning();
    return result;
  }
}

export const storage = new DatabaseStorage();