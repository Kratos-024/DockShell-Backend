import express from "express";
import cors from "cors";
import { userRouter } from "./routes/user.routes";
import { levelRouter } from "./routes/levels.routes";
const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

app.use("/api/v1/user", userRouter);
app.use("/api/v1/level", levelRouter);

export { app };
