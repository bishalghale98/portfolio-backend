import { Request, Response } from "express";
import { prisma } from "../../config/dbConnect";

// GET /api/v1/social-links
export const getSocialLinks = async (_req: Request, res: Response) => {
    try {
        const socialLinks = await prisma.socialLink.findMany({
            orderBy: { sortOrder: "asc" },
        });

        return res.json(socialLinks);
    } catch (error) {
        console.error("Error fetching social links:", error);
        return res.status(500).json({ error: "Failed to fetch social links" });
    }
};

// POST /api/v1/social-links
export const createSocialLink = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const body: any = req.body;

        const socialLink = await prisma.socialLink.create({
            data: {
                ...body,
                profileId: (body.profileId as string) || (await prisma.profile.findUnique({ where: { userId: user.id } }))?.id as string,
                sortOrder: parseInt(body.sortOrder as string) || 0,
            },
        });

        return res.status(201).json(socialLink);
    } catch (error) {
        console.error("Error creating social link:", error);
        return res.status(500).json({ error: "Failed to create social link" });
    }
};

// GET /api/v1/social-links/:id
export const getSocialLinkById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const socialLink = await prisma.socialLink.findUnique({ where: { id: id as string } });
        if (!socialLink) return res.status(404).json({ error: "Social link not found" });
        return res.json(socialLink);
    } catch (error) {
        console.error("Error fetching social link:", error);
        return res.status(500).json({ error: "Failed to fetch social link" });
    }
};

// PUT /api/v1/social-links/:id
export const updateSocialLink = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const body: any = req.body;
        const socialLink = await prisma.socialLink.update({
            where: { id: id as string },
            data: body,
        });
        return res.json(socialLink);
    } catch (error) {
        console.error("Error updating social link:", error);
        return res.status(500).json({ error: "Failed to update social link" });
    }
};

// DELETE /api/v1/social-links/:id
export const deleteSocialLink = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.socialLink.delete({ where: { id: id as string } });
        return res.json({ message: "Social link deleted successfully" });
    } catch (error) {
        console.error("Error deleting social link:", error);
        return res.status(500).json({ error: "Failed to delete social link" });
    }
};
