import { Router } from "express";

import { createProfile, deleteProfile, getProfile, updateProfile } from "./profile.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import upload from "../../middlewares/upload.middleware";

const router = Router();

router.get("/", getProfile);
router.post("/", authenticate, upload.single('profile'), createProfile);
router.put("/", authenticate, upload.single('profile'), updateProfile);
router.delete("/", authenticate, deleteProfile);

export default router;
