import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from './prisma';
import { authOptions } from './authOptions';

export { authOptions };

export interface AuthUser {
  id: number;
  email: string;
  role: string;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(user: AuthUser): string {
  const secret = process.env.JWT_SECRET || 'your-secret-key';
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, secret, { expiresIn: '1d' });
}

export async function verifyToken(token: string): Promise<AuthUser | null> {
  try {
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const decoded = jwt.verify(token, secret) as AuthUser;
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  } catch (error) {
    return null;
  }
}
