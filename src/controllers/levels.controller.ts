import type { Request, Response } from "express";
import { levelCreateSchema } from "../types/Levels.type";
import { prisma } from "../db";

class LevelController {
  public async createLevel(req: Request, res: Response) {
    try {
      const levelData = levelCreateSchema.safeParse(req.body);
      if (!levelData.success) {
        return res.status(400).json({
          statusCode: 400,
          error: levelData.error,
        });
      }

      const {
        uniqueId,
        goal,
        description,
        commands,
        hints,
        files,
        links,
        expectedOutput,
        difficulty,
        category,
        estimatedTime,
        createdAt,
      } = levelData.data;

      const levelExisted = await prisma.level.findFirst({
        where: { uniqueId },
      });
      if (levelExisted) {
        return res.status(409).json({
          statusCode: 409,
          error: "Level with this uniqueId already exists",
        });
      }

      const level = await prisma.level.create({
        data: {
          uniqueId,
          goal,
          description,
          commands: commands,
          hints: hints || undefined,
          files: files ? JSON.stringify(files) : null,
          links: links || [],
          expectedOutput: expectedOutput || null,
          difficulty,
          category,
          estimatedTime: `${estimatedTime}`,
          createdAt,
        },
      });

      return res.status(201).json({
        statusCode: 201,
        message: "Level created successfully",
        data: level,
      });
    } catch (error: any) {
      return res.status(500).json({
        statusCode: 500,
        error: error.message || "Internal Server Error",
      });
    }
  }
  public async getLevel(req: Request, res: Response) {
    try {
      const { uniqueId } = req.params;

      const level = await prisma.level.findUnique({ where: { uniqueId } });
      if (!level) {
        return res.status(404).json({
          statusCode: 404,
          error: "Level not found",
        });
      }

      return res.status(200).json({
        statusCode: 200,
        data: level,
      });
    } catch (error: any) {
      return res.status(500).json({
        statusCode: 500,
        error: error.message || "Internal Server Error",
      });
    }
  }

  public async getAllLevels(req: Request, res: Response) {
    try {
      const levels = await prisma.level.findMany();

      return res.status(200).json({
        statusCode: 200,
        count: levels.length,
        data: levels,
      });
    } catch (error: any) {
      return res.status(500).json({
        statusCode: 500,
        error: error.message || "Internal Server Error",
      });
    }
  }

  public async deleteLevel(req: Request, res: Response) {
    try {
      const { uniqueId } = req.params;

      const level = await prisma.level.findUnique({ where: { uniqueId } });
      if (!level) {
        return res.status(404).json({
          statusCode: 404,
          error: "Level not found",
        });
      }

      await prisma.level.delete({ where: { uniqueId } });

      return res.status(200).json({
        statusCode: 200,
        message: "Level deleted successfully",
      });
    } catch (error: any) {
      return res.status(500).json({
        statusCode: 500,
        error: error.message || "Internal Server Error",
      });
    }
  }
}
export { LevelController };
