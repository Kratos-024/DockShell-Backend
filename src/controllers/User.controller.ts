import type { Request, Response } from "express";
import {
  userCreateSchema,
  userLoginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../types/User.types";
import { prisma } from "../db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";

export class UserController {
  constructor() {}

  private _generateAndSaveToken = async (user: {
    id: string;
    username: string;
    email: string;
  }): Promise<string> => {
    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        email: user.email,
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "48h" }
    );

    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

    await prisma.authToken.create({
      data: {
        token,
        expiresAt,
        userId: user.id,
      },
    });

    return token;
  };

  public createUser = async (req: Request, res: Response) => {
    try {
      const createData = userCreateSchema.safeParse(req.body);
      if (!createData.success) {
        return res.status(400).json({
          statusCode: 400,
          error: createData.error,
        });
      }

      const { firstName, lastName, username, email, password } =
        createData.data;

      const userExisted = await prisma.user.findFirst({
        where: {
          OR: [{ username }, { email }],
        },
      });

      if (userExisted) {
        return res.status(409).json({
          statusCode: 409,
          error:
            userExisted.username === username
              ? "Username already exists"
              : "Email already exists",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: {
          firstName,
          LastName: lastName,
          username,
          email,
          password: hashedPassword,
        },
        select: {
          id: true,
          firstName: true,
          LastName: true,
          username: true,
          email: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      const token = await this._generateAndSaveToken(user);
      return res.status(201).json({
        statusCode: 201,
        message: "User created successfully",
        data: {
          user,
          token,
        },
      });
    } catch (error: any) {
      return res.status(500).json({
        statusCode: 500,
        error: error.message || "Internal Server Error",
      });
    }
  };

  public loginUser = async (req: Request, res: Response) => {
    try {
      const loginData = userLoginSchema.safeParse(req.body);
      if (!loginData.success) {
        return res.status(400).json({
          statusCode: 400,
          error: loginData.error,
        });
      }

      const { username, password } = loginData.data;

      const user = await prisma.user.findFirst({
        where: {
          OR: [{ username }, { email: username }],
        },
      });

      if (!user) {
        return res.status(401).json({
          statusCode: 401,
          error: "Invalid credentials",
        });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          statusCode: 401,
          error: "Invalid credentials",
        });
      }
      const token = await this._generateAndSaveToken(user);

      await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
      });

      return res.status(200).json({
        statusCode: 200,
        message: "Login successful",
        data: {
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.LastName,
            username: user.username,
            email: user.email,
          },
          token,
        },
      });
    } catch (error: any) {
      return res.status(500).json({
        statusCode: 500,
        error: error.message || "Internal Server Error",
      });
    }
  };
  public forgotPassword = async (req: Request, res: Response) => {
    try {
      const forgotData = forgotPasswordSchema.safeParse(req.body);
      if (!forgotData.success) {
        return res.status(400).json({
          statusCode: 400,
          error: forgotData.error,
        });
      }

      const { email } = forgotData.data;

      const user = await prisma.user.findFirst({
        where: { email },
      });

      if (!user) {
        return res.status(200).json({
          statusCode: 200,
          message: "If the email exists, a password reset link has been sent",
        });
      }

      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenExpiry = new Date(Date.now() + 3600000);

      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken,
          resetTokenExpiry,
        },
      });
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const resetUrl = `${
        process.env.FRONTEND_URL || "http://localhost:3000"
      }/reset-password?token=${resetToken}`;

      await transporter.sendMail({
        from: process.env.FROM_EMAIL || "noreply@dockshell.com",
        to: email,
        subject: "Password Reset Request - DockShell",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Password Reset Request</h2>
            <p>Hello ${user.firstName},</p>
            <p>You requested a password reset for your DockShell account. Click the link below to reset your password:</p>
            <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request this, please ignore this email.</p>
            <p>Best regards,<br>DockShell Team</p>
          </div>
        `,
      });

      return res.status(200).json({
        statusCode: 200,
        message: "If the email exists, a password reset link has been sent",
      });
    } catch (error: any) {
      return res.status(500).json({
        statusCode: 500,
        error: error.message || "Internal Server Error",
      });
    }
  };
  public resetPassword = async (req: Request, res: Response) => {
    try {
      const resetData = resetPasswordSchema.safeParse(req.body);
      if (!resetData.success) {
        return res.status(400).json({
          statusCode: 400,
          error: resetData.error,
        });
      }

      const { token, newPassword } = resetData.data;

      const user = await prisma.user.findFirst({
        where: {
          resetToken: token,
          resetTokenExpiry: {
            gte: new Date(),
          },
        },
      });

      if (!user) {
        return res.status(400).json({
          statusCode: 400,
          error: "Invalid or expired reset token",
        });
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          resetToken: null,
          resetTokenExpiry: null,
        },
      });

      return res.status(200).json({
        statusCode: 200,
        message: "Password reset successful",
      });
    } catch (error: any) {
      return res.status(500).json({
        statusCode: 500,
        error: error.message || "Internal Server Error",
      });
    }
  };

  public changeUsername = async (req: Request, res: Response) => {
    try {
      const { newUsername } = req.body;
      const userId = req.user?.userId;

      if (!newUsername || typeof newUsername !== "string") {
        return res.status(400).json({
          statusCode: 400,
          error: "New username is required",
        });
      }

      if (newUsername.length < 3 || newUsername.length > 20) {
        return res.status(400).json({
          statusCode: 400,
          error: "Username must be between 3 and 20 characters",
        });
      }

      const existingUser = await prisma.user.findFirst({
        where: {
          username: newUsername,
          NOT: { id: userId },
        },
      });

      if (existingUser) {
        return res.status(409).json({
          statusCode: 409,
          error: "Username already exists",
        });
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { username: newUsername },
        select: {
          id: true,
          firstName: true,
          LastName: true,
          username: true,
          email: true,
          updatedAt: true,
        },
      });

      return res.status(200).json({
        statusCode: 200,
        message: "Username updated successfully",
        data: updatedUser,
      });
    } catch (error: any) {
      return res.status(500).json({
        statusCode: 500,
        error: error.message || "Internal Server Error",
      });
    }
  };
  public validateSession = async (req: Request, res: Response) => {
    try {
      // The authMiddleware has already run and attached `req.user`
      const userId = req.user?.userId;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          firstName: true,
          LastName: true,
          username: true,
          email: true,
        },
      });

      if (!user) {
        return res.status(404).json({
          statusCode: 404,
          error: "User not found.",
        });
      }

      return res.status(200).json({
        statusCode: 200,
        message: "Session is valid.",
        data: { user },
      });
    } catch (error: any) {
      return res.status(500).json({
        statusCode: 500,
        error: "Internal Server Error during session validation.",
      });
    }
  };
}
