import { query } from "../utils/db";

type CreateGameInput = {
  name: string;
  category?: string;
  min_age?: number;
  players?: number;
  stock?: number;
  tags?: string[];
};



export const createGame = async (data: CreateGameInput) => {
  const {
    name,
    category = null,
    min_age = null,
    players = null,
    stock = 0,
    tags = [],
  } = data;

  const result = await query(
    `INSERT INTO games (name, category, min_age, players, stock, tags)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [name, category, min_age, players, stock, tags]
  );

  return result.rows[0];
};
import { pool } from "../utils/db";

export async function deleteGameById(id: number): Promise<boolean> {
  const { rows } = await pool.query(`DELETE FROM games WHERE id = $1 RETURNING id`, [id]);
  return rows.length > 0;
}



export const getGames = async (filters: any) => {
  
  const params: any[] = [];
  const where: string[] = [];

  if (filters?.category) {
    params.push(filters.category);
    where.push(`category = $${params.length}`);
  }

  if (filters?.min_age) {
    params.push(Number(filters.min_age));
    where.push(`min_age >= $${params.length}`);
  }

  if (filters?.players) {
    params.push(Number(filters.players));
    where.push(`players = $${params.length}`);
  }

  if (filters?.in_stock === "true") {
    where.push(`stock > 0`);
  }

  if (filters?.search) {
    params.push(`%${String(filters.search)}%`);
    
    where.push(`(name ILIKE $${params.length} OR array_to_string(tags, ' ') ILIKE $${params.length})`);
  }

  const sql = `
    SELECT *
    FROM games
    ${where.length ? "WHERE " + where.join(" AND ") : ""}
    ORDER BY created_at DESC
  `;

  const result = await query(sql, params);
  return result.rows;
};
