import { Router } from "express";
import { createWorkExperience, deleteWorkExperience, getWorkExperience, getWorkExperienceById, updateWorkExperience } from "./work-experience.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import upload from "../../middlewares/upload.middleware";

const router = Router();

router.get("/", getWorkExperience);
router.get("/:id", getWorkExperienceById);
router.post("/", authenticate, upload.single('logo'), createWorkExperience);
router.put("/:id", authenticate, upload.single('logo'), updateWorkExperience);
router.delete("/:id", authenticate, deleteWorkExperience);

export default router;
