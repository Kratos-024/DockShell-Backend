import { z } from "zod";

const userCreateSchema = z.object({
  username: z
    .string()
    .max(15, "User name can't be bigger than 15")
    .min(3, "Username can't be smaller than 3"),

  email: z.string().email("Invalid email format"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(100, "Password can't be longer than 100 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[@$!%*?&#]/,
      "Password must contain at least one special character (@, $, !, %, *, ?, &, #)"
    ),
});
const userLoginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export { userCreateSchema, userLoginSchema };
