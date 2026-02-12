import { Router } from "express";
import { createSkill, getSkills } from "./skills.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

router.get("/", getSkills);
router.post("/", authenticate, createSkill);

export default router;
