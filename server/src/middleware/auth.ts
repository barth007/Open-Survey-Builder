import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';

interface JwtPayload {
    userId: string;
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      id: string;
    };
  }
}

export const auth = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    try {
        if (!config.jwtSecret) {
            return res.status(500).json({ message: 'Internal server configuration error' });
        }

        const decoded = jwt.verify(token, config.jwtSecret) as unknown as { userId: string };
        req.user = { id: decoded.userId };
        next();
    } catch {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

// Optional auth: populates req.user if token is valid, but doesn't reject unauthenticated requests
export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return next();
    }

    const token = authHeader.split(' ')[1];
    try {
        if (config.jwtSecret) {
            const decoded = jwt.verify(token, config.jwtSecret) as unknown as { userId: string };
            req.user = { id: decoded.userId };
        }
    } catch {
        // Token invalid, proceed without user context
    }
    next();
};
