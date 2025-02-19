import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { verify } from "hono/jwt";

import { postBlog, putBlog, particularBlog } from "../zod";

export const blogRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
  Variables: {
    authorId: number;
  };
}>();
blogRouter.use("/*", async (c, next) => {
  const token = (await c.req.header("Authorization")) as string;
  try {
    const payload = await verify(token, c.env.JWT_SECRET);
    if (payload) {
      c.set("authorId", payload.id as number);
      console.log(payload.id);
      return await next();
    } else {
      c.status(403);
      c.json({ msg: "You are not authorized to access this route" });
    }
  } catch (error) {
    c.status(403);
    return c.json({ error: error });
  }
});

blogRouter.post("/", async (c) => {
  console.log("Raeched Route");
  const body = await c.req.json();
  const { success } = postBlog.safeParse(body);
  if (!success) {
    c.status(411);
    return c.json({ msg: "Invalid Input" });
  }
  const id = c.get("authorId");
  console.log("Body", body);
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const post = await prisma.post.create({
      data: {
        authorId: id,
        title: body.title,
        content: body.content,
      },
    });
    c.status(201);
    return c.json({
      msg: "Post Creation Done",
      post: post,
    });
  } catch (error) {
    c.status(403);
    return c.json({ error: error });
  }
});

blogRouter.put("/", async (c) => {
  const body = await c.req.json();
  const { success } = putBlog.safeParse(body);
  if (!success) {
    c.status(411);
    return c.json({ msg: "INvalid Input" });
  }
  //const id = c.get("authorId");
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  try {
    const post = await prisma.post.update({
      where: {
        id: body.id,
      },
      data: {
        title: body.title,
        content: body.content,
      },
    });
    return c.json({ message: "Update Blog " });
  } catch (error) {
    c.status(411);
    return c.json({ msg: error });
  }
});
blogRouter.get("/bulk", async (c) => {
  const authorId = await c.get("authorId");
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  const post = await prisma.post.findMany({
    where: {
      authorId: authorId,
    },
  });
  if (!post) {
    c.status(403);
    c.json({ msg: "YOu dont have nay posts" });
  }
  c.status(201);
  return c.json({ msg: post });
});

blogRouter.get("/:id", async (c) => {
  const param = await c.req.param("id");
  const { success } = particularBlog.safeParse(param);
  if (!success) {
    c.status(411);
    return c.json({ msg: "Invalid params" });
  }
  console.log(param);
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  const post = await prisma.post.findFirst({
    where: {
      id: Number(param),
    },
  });
  console.log(post);
  if (!post) {
    c.status(403);
    return c.json({ msg: "There is no post" });
  }

  return c.json({ Post: post });
});
