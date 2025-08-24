import type { Request, Response } from "express";
import { userCreateSchema } from "../types/User.types";
import { prisma } from "../db";
import bcrypt from "bcrypt";
export class UserController {
  constructor() {}

  public createUser = async (req: Request, res: Response) => {
    try {
      const createData = userCreateSchema.safeParse(req.body);
      if (!createData.success) {
        return res.status(400).json({
          statusCode: 400,
          error: createData.error,
        });
      }

      const { username, email, password } = createData.data;

      const userExisted = await prisma.user.findFirst({ where: { username } });
      if (userExisted) {
        return res.status(409).json({
          statusCode: 409,
          error: "User already exists",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: { username, email, password: hashedPassword },
      });

      return res.status(201).json({
        statusCode: 201,
        message: "User created successfully",
        data: user,
      });
    } catch (error: any) {
      return res.status(500).json({
        statusCode: 500,
        error: error.message || "Internal Server Error",
      });
    }
  };
}
