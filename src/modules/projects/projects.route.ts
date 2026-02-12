import { Router } from "express";
import { createProject, deleteProject, getProject, getProjects, updateProject } from "./projects.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import upload from "../../middlewares/upload.middleware";

const router = Router();

router.get("/", getProjects);
router.get("/:id", getProject);
router.post("/", authenticate, upload.single('image'), createProject);
router.put("/:id", authenticate, upload.single('image'), updateProject);
router.delete("/:id", authenticate, deleteProject);

export default router;
