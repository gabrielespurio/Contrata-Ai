import type { Request, Response } from "express";
import { storage } from "../storage";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-here';

export async function syncClerkUser(req: Request, res: Response) {
  try {
    const { name, email, type, city, clerkId } = req.body;

    if (!name || !email || !type || !clerkId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if user already exists by email or clerkId
    let existingUser;
    try {
      existingUser = await storage.getUserByEmail(email);
    } catch (error) {
      // User doesn't exist, which is fine
    }

    let user;
    if (existingUser) {
      // Update existing user with Clerk ID if not already set
      user = await storage.updateUser(existingUser.id, {
        clerkId: clerkId,
        name: name,
        type: type
      });
    } else {
      // Create new user
      user = await storage.createUser({
        name,
        email,
        type,
        city: city || 'São Paulo',
        clerkId,
        premium: false,
        destaque: false
      });
    }

    // Generate JWT token for our system
    const token = jwt.sign(
      { userId: user.id, email: user.email, type: user.type },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ user, token });
  } catch (error) {
    console.error('Error syncing Clerk user:', error);
    res.status(500).json({ message: "Internal server error" });
  }
}