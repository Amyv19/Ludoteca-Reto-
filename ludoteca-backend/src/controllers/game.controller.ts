import { Request, Response } from "express";
import { createGame, getGames, deleteGameById } from "../services/game.service";

export const createGameController = async (req: Request, res: Response) => {
  try {
    const game = await createGame(req.body);
    return res.status(201).json(game);
  } catch (err) {
    console.error("createGameController ERROR:", err);
    return res.status(500).json({ message: "Error creating game" });
  }
};

export async function importGamesXmlController(req: Request, res: Response) {
  try {
    if (!req.file) return res.status(400).json({ message: "Archivo XML requerido" });
    const xml = req.file.buffer.toString("utf-8");
    return res.json({ message: "XML recibido", size: xml.length });
  } catch {
    return res.status(500).json({ message: "Error importando XML" });
  }
}

export const getGamesController = async (req: Request, res: Response) => {
  try {
    const games = await getGames(req.query);
    return res.json(games);
  } catch (err) {
    console.error("getGamesController ERROR:", err);
    return res.status(500).json({ message: "Error fetching games" });
  }
};

export const deleteGameController = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ message: "ID inválido" });

    const ok = await deleteGameById(id);
    if (!ok) return res.status(404).json({ message: "Juego no encontrado" });

    return res.json({ message: "Juego eliminado" });
  } catch (err) {
    console.error("deleteGameController ERROR:", err);
    return res.status(500).json({ message: "Error deleting game" });
  }
};
