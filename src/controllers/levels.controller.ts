import type { Request, Response } from "express";
import { levelCreateSchema, saveLevelSchema } from "../types/Levels.type";
import { prisma } from "../db";
import { success } from "zod";

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
        ctfName,
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

      const levelExisted = await prisma.ctfLevels.findFirst({
        where: { uniqueId },
      });
      if (levelExisted) {
        return res.status(409).json({
          statusCode: 409,
          error: "Level with this uniqueId already exists",
        });
      }

      const level = await prisma.ctfLevels.create({
        data: {
          uniqueId,
          goal,
          ctfName,
          levelNo: 3,
          description,
          commands: commands,
          hints: hints,
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

      const level = await prisma.ctfLevels.findUnique({
        where: { uniqueId },
      });
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
      const levels = await prisma.ctfLevels.findMany();

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

      const level = await prisma.ctfLevels.findUnique({ where: { uniqueId } });
      if (!level) {
        return res.status(404).json({
          statusCode: 404,
          error: "Level not found",
        });
      }

      await prisma.ctfLevels.delete({ where: { uniqueId } });

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
  public saveLevelProgress = async (req: Request, res: Response) => {
    try {
      const user = req.user;
      if (!user?.userId) {
        return res.status(401).json({ error: "User not authenticated." });
      }

      const validationResult = saveLevelSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ error: validationResult.error.format() });
      }
      const { ctfName, levelNo, password } = validationResult.data;
      console.log({ ctfName, levelNo, password });
      const ctfProgress = await prisma.ctfProgress.upsert({
        where: {
          username_ctfName: { username: user.username, ctfName },
        },
        update: {},
        create: {
          username: user.username,
          ctfName: ctfName,
        },
      });

      const newClaimedLevel = await prisma.ctfClaimed.create({
        data: {
          levelNo,
          password,

          ctfprogress: {
            connect: { id: ctfProgress.id },
          },
        },
      });
      console.log("fdsjfdsgfdf", newClaimedLevel);
      return res.status(201).json({
        message: `Progress for ${ctfName} Level ${levelNo} saved successfully.`,
        data: newClaimedLevel,
      });
    } catch (error: any) {
      if (error.code === "P2002") {
        return res
          .status(409)
          .json({ error: "This level has already been claimed by the user." });
      }
      console.error("Error saving level progress:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  };

  public getAllUserProgress = async (req: Request, res: Response) => {
    try {
      const user = req.user;
      if (!user?.userId) {
        return res
          .status(401)
          .json({ success: false, error: "User not authenticated." });
      }

      const allProgress = await prisma.ctfProgress.findMany({
        where: { username: user.username },
        include: {
          ctfClaimeds: {},
        },
      });
      console.log(allProgress);
      if (!allProgress.length) {
        return res.status(404).json({
          success: true,
          message: "No progress found for this user.",
        });
      }

      return res.status(200).json({ success: true, data: allProgress });
    } catch (error: any) {
      console.error("Error fetching user progress:", error);
      return res
        .status(500)
        .json({ success: false, error: "Internal Server Error" });
    }
  };

  // public getLevelProgress = async (req: Request, res: Response) => {
  //   try {
  //     const userId = req.user?.userId;
  //     if (!userId) {
  //       return res.status(401).json({ error: "User not authenticated." });
  //     }
  //     const { ctfName } = req.params;
  //     const levelNo = parseInt(req.params.levelNo, 10);

  //     if (!ctfName || isNaN(levelNo)) {
  //       return res
  //         .status(400)
  //         .json({ error: "Invalid ctfName or levelNo parameter." });
  //     }

  //     const levelProgress = await prisma.ctfClaimed.findFirst({
  //       where: {
  //         levelNo: levelNo,
  //         ctfProgress: {
  //           userId: userId,
  //           ctfName: ctfName,
  //         },
  //       },
  //     });

  //     if (!levelProgress) {
  //       return res.status(404).json({
  //         message: `Progress for ${ctfName} Level ${levelNo} not found.`,
  //       });
  //     }

  //     return res.status(200).json({ data: levelProgress });
  //   } catch (error: any) {
  //     console.error("Error fetching level progress:", error);
  //     return res.status(500).json({ error: "Internal Server Error" });
  //   }
  // };
}
export { LevelController };
