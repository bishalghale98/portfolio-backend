import { Router } from "express";
import { createBlogPost, deleteBlogPost, getBlogPostBySlug, getBlogPosts, updateBlogPost } from "./blog.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import upload from "../../middlewares/upload.middleware";

const router = Router();

router.get("/", getBlogPosts);
router.get("/:slug", getBlogPostBySlug);
router.post("/", authenticate, upload.single('coverImage'), createBlogPost);
router.put("/:id", authenticate, upload.single('coverImage'), updateBlogPost);
router.delete("/:id", authenticate, deleteBlogPost);

export default router;
