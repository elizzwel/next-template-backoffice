import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify, JWTPayload } from 'jose';

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

export async function hashPassword(password: string): Promise<string> {
  try {
    return await bcrypt.hash(password, 10);
  } catch (error) {
    console.error('Hash password error:', error);
    throw error;
  }
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    console.error('Verify password error:', error);
    throw error;
  }
}

export async function createToken(payload: JWTPayload): Promise<string> {
  try {
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(secret);
    return token;
  } catch (error) {
    console.error('Create token error:', error);
    throw error;
  }
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error) {
    console.error('Verify token error:', error);
    return null;
  }
}

interface UserRole {
  permissions?: string[];
  [key: string]: any;
}

export function hasPermission(
  userRole: UserRole,
  requiredPermission: string
): boolean {
  return userRole.permissions?.includes(requiredPermission) || false;
}