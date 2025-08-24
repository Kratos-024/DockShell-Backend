import { Router } from "express";
import { UserController } from "../controllers/User.controller";

const userRouter = Router();
const user = new UserController();
userRouter.route("/create").post(user.createUser);

export { userRouter };
