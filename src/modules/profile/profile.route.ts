import { Router } from "express";

import { createProfile, deleteProfile, getProfile, updateProfile } from "./profile.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import upload from "../../middlewares/upload.middleware";

const router = Router();

router.get("/", getProfile);
router.post("/", authenticate, upload.single('image'), createProfile);
router.put("/", authenticate, upload.single('image'), updateProfile);
router.delete("/", authenticate, deleteProfile);

export default router;
