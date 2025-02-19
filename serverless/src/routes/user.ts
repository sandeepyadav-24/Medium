import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { decode, sign, verify } from "hono/jwt";
import { z } from "zod";

const signupInput = z.object({
  name: z.string().max(30),
  email: z.string().email(),
  password: z.string().max(30),
});

const loginInput = z.object({
  email: z.string().email(),
  password: z.string().max(30),
});

export const userRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
}>();

// Sign up  Router
userRouter.post("/signup", async (c) => {
  const body = await c.req.json();
  const { success } = signupInput.safeParse(body);
  if (!success) {
    c.status(411);
    return c.json({ msg: "Invalid Input" });
  }
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const user = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        password: body.password,
      },
    });
    const token = await sign(user, c.env.JWT_SECRET);
    console.log("Token", token);

    return c.json({ token: token });
  } catch (error) {
    console.error(error);
    return c.json({ error: error });
  }
});
// Login Route
userRouter.post("/login", async (c) => {
  const body = await c.req.json();
  const { success } = loginInput.safeParse(body);
  if (!success) {
    c.status(411);
    return c.json({ msg: "Inavlid INput" });
  }
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const user = await prisma.user.findUnique({
    where: {
      email: body.email,
    },
  });
  if (!user) {
    c.status(403);
    return c.json({
      message: "User not found",
    });
  }
  const token = await sign(user, c.env.JWT_SECRET);

  return c.json({ message: "Login  done ", token: token });
});
