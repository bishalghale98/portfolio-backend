import { Router } from "express";
import { createEducation, deleteEducation, getEducation, getEducationById, updateEducation } from "./education.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

router.get("/", getEducation);
router.get("/:id", getEducationById);
router.post("/", authenticate, createEducation);
router.put("/:id", authenticate, updateEducation);
router.delete("/:id", authenticate, deleteEducation);

export default router;
