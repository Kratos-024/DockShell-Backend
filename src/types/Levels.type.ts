import { z } from "zod";

const levelCreateSchema = z.object({
  uniqueId: z.string(), // if frostling and level0 then frostling-level0
  goal: z.string().min(10, "Goal must be descriptive (min 10 chars)"),
  description: z.string().min(20, "Description must explain the scenario"),
  commands: z.array(z.string().min(1, "Must specify useful commands")),
  hints: z.array(z.string()).optional(),
  links: z.array(z.string()).optional(),
  files: z
    .array(
      z.object({
        filename: z.string(),
        content: z.string(),
        permissions: z
          .string()
          .regex(/^[0-7]{3}$/, "Must be octal permissions like 644"),
        hidden: z.boolean().default(false),
      })
    )
    .optional(),

  expectedOutput: z.string().optional().optional(),
  difficulty: z.enum(["beginner", "intermediate", "advanced", "expert"]),
  category: z.enum([
    "filEexploration",
    "crypto",
    "web",
    "binary",
    "forensics",
    "network",
  ]),
  estimatedTime: z.number().min(1).max(120),

  createdAt: z.date().default(() => new Date()),
});
const saveLevelSchema = z.object({
  ctfName: z.string().min(1, "CTF name is required."),
  levelNo: z
    .number()
    .int()
    .positive("Level number must be a positive integer."),
  password: z.string().min(1, "Password is required."),
});

export { levelCreateSchema, saveLevelSchema };
