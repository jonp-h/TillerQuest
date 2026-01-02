import { Request } from "express";

// Extend Express Request type to include session
export interface AuthSession {
  user: {
    id: string;
    email: string;
    name: string;
    image?: string | null;
    username: string;
    role: string;
    class: string;
    emailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
  session: {
    id: string;
    userId: string;
    expiresAt: Date;
    token: string;
    ipAddress?: string | null;
    userAgent?: string | null;
  };
}

export interface AuthenticatedRequest extends Request {
  session?: AuthSession;
}
