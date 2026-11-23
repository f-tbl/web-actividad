import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

const SECRET = process.env.JWT_SECRET ?? "dev-secret-cambiar";

export type Role = "admin" | "user";
export type TokenPayload = { id: number; username: string; role: Role };

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

// shortcut: usuarios en memoria (se pierden al reiniciar), reemplazar por una DB real.
const users = [
  { id: 1, username: "admin", password: await Bun.password.hash("admin123"), role: "admin" as Role },
  { id: 2, username: "user", password: await Bun.password.hash("user123"), role: "user" as Role },
];

export async function login(req: Request, res: Response) {
  const { username, password } = req.body ?? {};
  const user = users.find((u) => u.username === username);
  if (!user || !(await Bun.password.verify(String(password ?? ""), user.password)))
    return res.status(401).json({ error: "Credenciales inválidas" });

  const payload: TokenPayload = { id: user.id, username: user.username, role: user.role };
  res.json({ token: jwt.sign(payload, SECRET, { expiresIn: "1h" }) });
}

// Ruta privada: exige un JWT válido en "Authorization: Bearer <token>".
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const [scheme, token] = (req.headers.authorization ?? "").split(" ");
  if (scheme !== "Bearer" || !token) return res.status(401).json({ error: "Token requerido" });
  try {
    req.user = jwt.verify(token, SECRET) as TokenPayload;
    next();
  } catch {
    res.status(401).json({ error: "Token inválido o expirado" });
  }
}

// Ruta protegida por rol: se usa después de requireAuth.
export const requireRole =
  (...roles: Role[]) =>
  (req: Request, res: Response, next: NextFunction) =>
    req.user && roles.includes(req.user.role) ? next() : res.status(403).json({ error: "Permisos insuficientes" });
