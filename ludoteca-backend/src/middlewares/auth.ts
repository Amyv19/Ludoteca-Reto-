import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization || "";
  const [type, token] = header.split(" ");

  if (type !== "Bearer" || !token) {
    return res.status(401).json({ message: "No autorizado" });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    (req as any).user = payload;
    return next();
  } catch {
    return res.status(401).json({ message: "Token inválido" });
  }
}
