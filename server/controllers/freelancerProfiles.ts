import type { Request, Response } from "express";
import { insertFreelancerProfileSchema } from "@shared/schema";
import { storage } from "../storage";
import { z } from "zod";

export async function createFreelancerProfile(req: Request, res: Response) {
  try {
    const validatedData = insertFreelancerProfileSchema.parse(req.body);
    const userId = (req as any).user.userId;

    // Check if profile already exists
    const existingProfile = await storage.getFreelancerProfile(userId);
    if (existingProfile) {
      return res.status(400).json({ message: "Perfil já existe para este usuário" });
    }

    const profile = await storage.createFreelancerProfile({
      ...validatedData,
      userId
    });

    res.status(201).json(profile);
  } catch (error) {
    console.error('Create freelancer profile error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
    }
    res.status(500).json({ message: "Erro interno do servidor" });
  }
}

export async function getFreelancerProfile(req: Request, res: Response) {
  try {
    const userId = (req as any).user.userId;
    const profile = await storage.getFreelancerProfile(userId);
    
    if (!profile) {
      return res.status(404).json({ message: "Perfil não encontrado" });
    }

    res.json(profile);
  } catch (error) {
    console.error('Get freelancer profile error:', error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
}

export async function updateFreelancerProfile(req: Request, res: Response) {
  try {
    const userId = (req as any).user.userId;
    const updates = req.body;

    const profile = await storage.updateFreelancerProfile(userId, updates);
    res.json(profile);
  } catch (error) {
    console.error('Update freelancer profile error:', error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
}