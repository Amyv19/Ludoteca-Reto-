import express from "express";
import dotenv from "dotenv";
import path from "path";

import { pool } from "./utils/db";
import gameRoutes from "./routes/game.routes";
import authRoutes from "./routes/auth.routes";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

const publicDir = path.join(process.cwd(), "public");
app.use(express.static(publicDir, { index: false }));

app.get("/", (_req, res) => {
  return res.sendFile(path.join(publicDir, "login.html"));
});

app.get("/app", (_req, res) => {
  return res.sendFile(path.join(publicDir, "index.html"));
});

app.get("/api/health", async (_req, res) => {
  try {
    const now = await pool.query("SELECT NOW() as now");
    const checkTable = await pool.query(`
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'games'
      ) as games_exists
    `);

    return res.json({
      ok: true,
      dbTime: now.rows[0],
      gamesTableExists: checkTable.rows[0]?.games_exists,
      env: {
        DB_HOST: process.env.DB_HOST,
        DB_PORT: process.env.DB_PORT,
        DB_USER: process.env.DB_USER,
        DB_NAME: process.env.DB_NAME,
      },
    });
  } catch (err: any) {
    return res.status(500).json({
      ok: false,
      errorName: err?.name,
      errorMessage: err?.message,
      errorCode: err?.code,
      detail: err?.detail,
    });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/games", gameRoutes);

app.use((_req, res) => {
  return res.status(404).json({ message: "Not found" });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
