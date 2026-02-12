import { Router } from "express";
import { createSocialLink, deleteSocialLink, getSocialLinkById, getSocialLinks, updateSocialLink } from "./social-links.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

router.get("/", getSocialLinks);
router.get("/:id", getSocialLinkById);
router.post("/", authenticate, createSocialLink);
router.put("/:id", authenticate, updateSocialLink);
router.delete("/:id", authenticate, deleteSocialLink);

export default router;
