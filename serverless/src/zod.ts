import { z } from "zod";
export const signupInput = z.object({
  name: z.string().max(30),
  email: z.string().email(),
  password: z.string().max(30),
});

export const loginInput = z.object({
  email: z.string().email(),
  password: z.string().max(30),
});

export const postBlog = z.object({
  title: z.string().max(100),
  content: z.string().max(2500),
});

export const putBlog = z.object({
  id: z.number(),
  title: z.string().max(100),
  content: z.string().max(2500),
});

export const particularBlog = z.object({
  id: z.number(),
});
