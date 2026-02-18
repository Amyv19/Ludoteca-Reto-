import { Request, Response } from "express";
import { z } from "zod";
import { registerUser, loginUser } from "../services/auth.service";

const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function registerController(req: Request, res: Response) {
  const parsed = authSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Datos inválidos", issues: parsed.error.issues });

  try {
    const user = await registerUser(parsed.data.email, parsed.data.password);
    return res.status(201).json(user);
  } catch (e: any) {
    // email duplicado
    return res.status(400).json({ message: e?.message || "No se pudo registrar" });
  }
}

export async function loginController(req: Request, res: Response) {
  const parsed = authSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Datos inválidos", issues: parsed.error.issues });

  try {
    const result = await loginUser(parsed.data.email, parsed.data.password);
    return res.json(result);
  } catch (e: any) {
    return res.status(401).json({ message: e?.message || "Credenciales inválidas" });
  }
}
