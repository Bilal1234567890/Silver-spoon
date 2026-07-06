import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number; role: string };
    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Admin access required' });
    }
    req.userId = decoded.id; // optional
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
};