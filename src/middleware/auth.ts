import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin.ts';
import {
  getOrCreateUser,
  verifySignedAdminToken,
} from '../db/users.ts';
import { getSupabaseServerClient } from '../lib/supabase-sync.ts';

export interface AuthRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    name?: string;
  };
  dbUser?: {
    id: number;
    uid: string;
    email: string;
    fullName: string | null;
    role: string;
  };
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res
      .status(401)
      .json({ error: 'Unauthorized: Missing authentication token' });
  }

  const token = authHeader.split('Bearer ')[1];

  // 1. Try Signed Layitek Admin Session Token
  const signedPayload = verifySignedAdminToken(token);
  if (signedPayload) {
    try {
      req.user = signedPayload;
      const dbUser = await getOrCreateUser(
        signedPayload.uid,
        signedPayload.email,
        signedPayload.name
      );
      req.dbUser = dbUser;
      return next();
    } catch (err) {
      console.error('Error synchronizing signed admin user:', err);
    }
  }

  // 2. Try Firebase ID Token Verification
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name,
    };

    const email = decodedToken.email || 'admin@layitek.com';
    const dbUser = await getOrCreateUser(
      decodedToken.uid,
      email,
      decodedToken.name || 'Layitek Administrator'
    );
    req.dbUser = dbUser;
    return next();
  } catch {
    // Proceed to check Supabase Auth token
  }

  // 3. Try Supabase Auth JWT Verification
  try {
    const supabaseClient = getSupabaseServerClient();
    if (supabaseClient) {
      const { data, error } = await supabaseClient.auth.getUser(token);
      if (!error && data?.user) {
        const sbUser = data.user;
        const email = sbUser.email || 'admin@layitek.com';
        req.user = {
          uid: sbUser.id,
          email,
          name: sbUser.user_metadata?.full_name || 'Layitek Administrator',
        };
        const dbUser = await getOrCreateUser(
          sbUser.id,
          email,
          sbUser.user_metadata?.full_name || 'Layitek Administrator'
        );
        req.dbUser = dbUser;
        return next();
      }
    }
  } catch (error) {
    console.error('Error verifying authentication token:', error);
  }

  return res
    .status(401)
    .json({ error: 'Unauthorized: Invalid or expired session token' });
};
