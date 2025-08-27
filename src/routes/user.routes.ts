import { Router } from "express";
import { UserController } from "../controllers/User.controller";
import { authMiddleware } from "../middlewares/user.auth.middleware";

const userRouter = Router();
const user = new UserController();

userRouter.route("/createAccount").post(user.createUser);
userRouter.route("/login").post(user.loginUser);

userRouter.route("/validate").get(authMiddleware, user.validateSession);

export { userRouter };
