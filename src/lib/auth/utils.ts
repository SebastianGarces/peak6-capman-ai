import bcrypt from "bcryptjs";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function requireAuth(session: any) {
  if (!session?.user) {
    throw new Error("Authentication required");
  }
  return session;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function requireRole(session: any, role: string) {
  requireAuth(session);
  if (session.user.role !== role && session.user.role !== "admin") {
    throw new Error(`Role '${role}' required`);
  }
  return session;
}
