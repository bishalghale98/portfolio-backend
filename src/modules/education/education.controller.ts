import { Request, Response } from "express";
import { prisma } from "../../config/dbConnect";

// GET /api/v1/education
export const getEducation = async (_req: Request, res: Response) => {
    try {
        const education = await prisma.education.findMany({
            orderBy: { startDate: "desc" },
        });

        return res.json(education);
    } catch (error) {
        console.error("Error fetching education:", error);
        return res.status(500).json({ error: "Failed to fetch education" });
    }
};

// POST /api/v1/education
export const createEducation = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const body: any = req.body;

        const education = await prisma.education.create({
            data: {
                institution: body.institution as string,
                degree: body.degree as string,
                logoUrl: body.logoUrl as string | undefined,
                startDate: new Date(body.startDate as string),
                endDate: body.endDate ? new Date(body.endDate as string) : undefined,
                profileId: (body.profileId as string) || (await prisma.profile.findUnique({ where: { userId: user.id } }))?.id as string,
            },
        });

        return res.status(201).json(education);
    } catch (error) {
        console.error("Error creating education:", error);
        return res.status(500).json({ error: "Failed to create education" });
    }
};

// GET /api/v1/education/:id
export const getEducationById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const education = await prisma.education.findUnique({ where: { id: id as string } });
        if (!education) return res.status(404).json({ error: "Education not found" });
        return res.json(education);
    } catch (error) {
        console.error("Error fetching education:", error);
        return res.status(500).json({ error: "Failed to fetch education" });
    }
};

// PUT /api/v1/education/:id
export const updateEducation = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const body: any = req.body;
        const education = await prisma.education.update({
            where: { id: id as string },
            data: body,
        });
        return res.json(education);
    } catch (error) {
        console.error("Error updating education:", error);
        return res.status(500).json({ error: "Failed to update education" });
    }
};

// DELETE /api/v1/education/:id
export const deleteEducation = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.education.delete({ where: { id: id as string } });
        return res.json({ message: "Education deleted successfully" });
    } catch (error) {
        console.error("Error deleting education:", error);
        return res.status(500).json({ error: "Failed to delete education" });
    }
};
