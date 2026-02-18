import bcrypt from "bcryptjs";
import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { pool } from "../utils/db";

const JWT_SECRET: Secret = process.env.JWT_SECRET || "dev_secret";
const JWT_EXPIRES_IN: SignOptions["expiresIn"] =
  (process.env.JWT_EXPIRES_IN as SignOptions["expiresIn"]) || "1d";

export async function registerUser(email: string, password: string) {
  const password_hash = await bcrypt.hash(password, 10);

  const q =
    `INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at`;
  const { rows } = await pool.query(q, [email.toLowerCase(), password_hash]);
  return rows[0];
}

export async function loginUser(email: string, password: string) {
  const q = `SELECT id, email, password_hash FROM users WHERE email = $1`;
  const { rows } = await pool.query(q, [email.toLowerCase()]);

  const user = rows[0];
  if (!user) throw new Error("Credenciales inválidas");

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) throw new Error("Credenciales inválidas");

  const token = jwt.sign(
    { sub: String(user.id), email: user.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  return { token };
}
