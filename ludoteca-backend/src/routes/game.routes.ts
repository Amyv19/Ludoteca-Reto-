import { Router } from "express";
import {
  createGameController,
  getGamesController,
  importGamesXmlController,
  deleteGameController,
} from "../controllers/game.controller";
import { validate } from "../middlewares/validate";
import { createGameSchema } from "../validators/game.schema";
import { upload } from "../middlewares/upload";
import { requireAuth } from "../middlewares/requireAuth.js";



const router = Router();

router.get("/", requireAuth, getGamesController);
router.post("/", requireAuth, validate(createGameSchema), createGameController);
router.post("/import-xml", requireAuth, upload.single("file"), importGamesXmlController);
router.delete("/:id", requireAuth, deleteGameController);

export default router;

