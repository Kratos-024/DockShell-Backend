import { Router } from "express";
import { LevelController } from "../controllers/levels.controller";

const levelRouter = Router();
const level = new LevelController();
levelRouter.route("/create").post(level.createLevel);
levelRouter.route("/getLevel/:uniqueId").post(level.getLevel);
levelRouter.route("/getAllLevel").post(level.getAllLevels);
levelRouter.route("/deleteLevel/:uniqueId").post(level.deleteLevel);

export { levelRouter };
