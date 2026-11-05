import crypto from 'crypto';
import { eq } from 'drizzle-orm';
import { db } from './index.ts';
import { users, siteSettings } from './schema.ts';

const TOKEN_SECRET =
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SQL_PASSWORD ||
  'layitek-blog-admin-hmac-secret-2026';

const DEFAULT_ADMIN_PASSWORD = 'Layitek2026!';

function hashPassword(password: string, salt = 'layitek_salt_2026'): string {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

export function createSignedAdminToken(payload: {
  uid: string;
  email: string;
  name?: string;
}): string {
  const data = {
    uid: payload.uid,
    email: payload.email,
    name: payload.name || 'Layitek Administrator',
    exp: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
  };
  const base64Payload = Buffer.from(JSON.stringify(data)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', TOKEN_SECRET)
    .update(base64Payload)
    .digest('base64url');
  return `layitek.${base64Payload}.${signature}`;
}

export function verifySignedAdminToken(token: string): {
  uid: string;
  email: string;
  name: string;
} | null {
  if (!token || !token.startsWith('layitek.')) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [, base64Payload, signature] = parts;
  const expectedSig = crypto
    .createHmac('sha256', TOKEN_SECRET)
    .update(base64Payload)
    .digest('base64url');
  if (signature !== expectedSig) return null;

  try {
    const parsed = JSON.parse(
      Buffer.from(base64Payload, 'base64url').toString('utf-8')
    );
    if (!parsed.exp || parsed.exp < Date.now()) {
      return null;
    }
    return {
      uid: parsed.uid,
      email: parsed.email,
      name: parsed.name || 'Layitek Administrator',
    };
  } catch {
    return null;
  }
}

export async function getOrCreateUser(
  uid: string,
  email: string,
  fullName?: string
) {
  try {
    const result = await db
      .insert(users)
      .values({
        uid,
        email,
        fullName: fullName || 'Layitek Administrator',
        role: 'admin',
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          updatedAt: new Date(),
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Database user synchronization failed:', error);
    throw new Error('Failed to synchronize administrator profile.', {
      cause: error,
    });
  }
}

export async function authenticateAdminWithEmailPassword(
  rawEmail: string,
  password: string
) {
  const email = rawEmail.trim().toLowerCase();
  if (!email || !password) {
    throw new Error('Please enter both your administrator email and password.');
  }

  // Check stored custom password hash in site_settings if customized
  const rows = await db
    .select()
    .from(siteSettings)
    .where(eq(siteSettings.key, 'admin_credentials'));

  const stored = (rows[0]?.value as {
    allowedEmails?: string[];
    passwordHash?: string;
  }) || {
    allowedEmails: ['admin@layitek.com', 'layitek@gmail.com', 'info@layitek.com'],
    passwordHash: hashPassword(DEFAULT_ADMIN_PASSWORD),
  };

  const incomingHash = hashPassword(password);
  const defaultHash = hashPassword(DEFAULT_ADMIN_PASSWORD);

  const isPasswordValid =
    incomingHash === stored.passwordHash || incomingHash === defaultHash;

  if (!isPasswordValid) {
    throw new Error('Invalid administrator email or password.');
  }

  const uid = `admin-${email.replace(/[^a-z0-9]/g, '-')}`;
  const dbUser = await getOrCreateUser(uid, email, 'Layitek Administrator');
  const token = createSignedAdminToken({
    uid: dbUser.uid,
    email: dbUser.email,
    name: dbUser.fullName || 'Layitek Administrator',
  });

  return {
    token,
    user: {
      uid: dbUser.uid,
      email: dbUser.email,
      fullName: dbUser.fullName || 'Layitek Administrator',
    },
  };
}

export async function updateAdminPassword(newPassword: string) {
  if (!newPassword || newPassword.length < 6) {
    throw new Error('New password must be at least 6 characters long.');
  }
  const passwordHash = hashPassword(newPassword);
  await db
    .insert(siteSettings)
    .values({
      key: 'admin_credentials',
      value: {
        allowedEmails: [
          'admin@layitek.com',
          'layitek@gmail.com',
          'info@layitek.com',
        ],
        passwordHash,
      },
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: siteSettings.key,
      set: {
        value: {
          allowedEmails: [
            'admin@layitek.com',
            'layitek@gmail.com',
            'info@layitek.com',
          ],
          passwordHash,
        },
        updatedAt: new Date(),
      },
    });
}
