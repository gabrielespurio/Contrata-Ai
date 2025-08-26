import { Request, Response } from 'express';
import { storage } from '../storage';
import { AuthRequest } from '../middleware/auth';

export async function getNotifications(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const notifications = await storage.getNotifications(userId);
    res.json(notifications);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function markNotificationAsRead(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const notification = await storage.markNotificationAsRead(id);
    res.json({ message: 'Notification marked as read', notification });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}