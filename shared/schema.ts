import { pgTable, text, uuid, boolean, timestamp, numeric, integer, date } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password"),
  type: text("type").notNull().$type<"freelancer" | "contratante">(),
  personType: text("person_type").$type<"individual" | "empresa">(),
  cpf: text("cpf"),
  cnpj: text("cnpj"),
  companyName: text("company_name"),
  phone: text("phone"),
  skills: text("skills"),
  experience: text("experience"),
  city: text("city").notNull(),
  premium: boolean("premium").default(false),
  destaque: boolean("destaque").default(false),
  clerkId: text("clerk_id").unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
});

export const subcategories = pgTable("subcategories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  categoryId: uuid("category_id").references(() => categories.id),
});

export const jobs = pgTable("jobs", {
  id: uuid("id").primaryKey().defaultRandom(),
  clientId: uuid("client_id").references(() => users.id),
  subcategoryId: uuid("subcategory_id").references(() => subcategories.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  // Mantemos date e time para compatibilidade com vagas simples (um dia só)
  date: date("date"),
  time: text("time"),
  // Novo campo para horários múltiplos - JSON array (temporariamente comentado)
  // schedules: text("schedules"), // JSON string: [{"day": "friday", "dayName": "Sexta-feira", "startTime": "20:00", "endTime": "23:00"}]
  location: text("location").notNull(),
  payment: numeric("payment").notNull(),
  destaque: boolean("destaque").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const applications = pgTable("applications", {
  id: uuid("id").primaryKey().defaultRandom(),
  jobId: uuid("job_id").references(() => jobs.id),
  freelancerId: uuid("freelancer_id").references(() => users.id),
  status: text("status").default("pending").$type<"pending" | "accepted" | "rejected">(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const jobLimits = pgTable("job_limits", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id),
  weekNumber: integer("week_number").notNull(),
  jobCount: integer("job_count").default(0),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  jobs: many(jobs),
  applications: many(applications),
  jobLimits: many(jobLimits),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  subcategories: many(subcategories),
}));

export const subcategoriesRelations = relations(subcategories, ({ one, many }) => ({
  category: one(categories, {
    fields: [subcategories.categoryId],
    references: [categories.id],
  }),
  jobs: many(jobs),
}));

export const jobsRelations = relations(jobs, ({ one, many }) => ({
  client: one(users, {
    fields: [jobs.clientId],
    references: [users.id],
  }),
  subcategory: one(subcategories, {
    fields: [jobs.subcategoryId],
    references: [subcategories.id],
  }),
  applications: many(applications),
}));

export const applicationsRelations = relations(applications, ({ one }) => ({
  job: one(jobs, {
    fields: [applications.jobId],
    references: [jobs.id],
  }),
  freelancer: one(users, {
    fields: [applications.freelancerId],
    references: [users.id],
  }),
}));

export const jobLimitsRelations = relations(jobLimits, ({ one }) => ({
  user: one(users, {
    fields: [jobLimits.userId],
    references: [users.id],
  }),
}));

// Zod schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
});

export const insertSubcategorySchema = createInsertSchema(subcategories).omit({
  id: true,
});

export const insertJobSchema = createInsertSchema(jobs).omit({
  id: true,
  createdAt: true,
});

export const insertApplicationSchema = createInsertSchema(applications).omit({
  id: true,
  createdAt: true,
});

export const insertJobLimitSchema = createInsertSchema(jobLimits).omit({
  id: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Subcategory = typeof subcategories.$inferSelect;
export type InsertSubcategory = z.infer<typeof insertSubcategorySchema>;
export type Job = typeof jobs.$inferSelect;
export type InsertJob = z.infer<typeof insertJobSchema>;
export type Application = typeof applications.$inferSelect;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type JobLimit = typeof jobLimits.$inferSelect;
export type InsertJobLimit = z.infer<typeof insertJobLimitSchema>;
