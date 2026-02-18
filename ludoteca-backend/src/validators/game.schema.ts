import { z } from "zod";

export const createGameSchema = z.object({
  name: z.string().min(1).max(120),
  category: z.string().min(1).max(60).optional(),
  min_age: z.number().int().min(0).max(99).optional(),
  players: z.number().int().min(1).max(50).optional(),
  stock: z.number().int().min(0).max(100000).optional(),
  tags: z.array(z.string().min(1).max(30)).max(20).optional(),
});
