"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.particularBlog = exports.putBlog = exports.postBlog = exports.loginInput = exports.signupInput = void 0;
const zod_1 = require("zod");
exports.signupInput = zod_1.z.object({
    name: zod_1.z.string().max(30),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().max(30),
});
exports.loginInput = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().max(30),
});
exports.postBlog = zod_1.z.object({
    title: zod_1.z.string().max(100),
    content: zod_1.z.string().max(2500),
});
exports.putBlog = zod_1.z.object({
    id: zod_1.z.number(),
    title: zod_1.z.string().max(100),
    content: zod_1.z.string().max(2500),
});
exports.particularBlog = zod_1.z.object({
    id: zod_1.z.number(),
});
