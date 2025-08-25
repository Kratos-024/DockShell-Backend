import { Router } from "express";
import { LevelController } from "../controllers/levels.controller";

const ctfLevelRouter = Router();
const ctfLevel = new LevelController();
ctfLevelRouter.route("/createLevel").post(ctfLevel.createLevel);
ctfLevelRouter.route("/getctfLevel/:uniqueId").post(ctfLevel.getLevel);
ctfLevelRouter.route("/getAllctfLevel").post(ctfLevel.getAllLevels);
ctfLevelRouter.route("/deleteCtfLevel/:uniqueId").post(ctfLevel.deleteLevel);

export { ctfLevelRouter };
