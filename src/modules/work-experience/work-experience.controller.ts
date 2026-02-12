import { Request, Response } from "express";
import { prisma } from "../../config/dbConnect";

// GET /api/v1/work-experience
export const getWorkExperience = async (_req: Request, res: Response) => {
    try {
        const workExperience = await prisma.workExperience.findMany({
            orderBy: { startDate: "desc" },
        });

        return res.json(workExperience);
    } catch (error) {
        console.error("Error fetching work experience:", error);
        return res.status(500).json({ error: "Failed to fetch work experience" });
    }
};

// POST /api/v1/work-experience
export const createWorkExperience = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const body: any = req.body;
        let logoUrl = body.logoUrl;

        // Handle file upload
        if (req.file) {
            logoUrl = (req.file as any).path;
        }

        const workExperience = await prisma.workExperience.create({
            data: {
                company: body.company as string,
                position: body.position as string,
                startDate: new Date(body.startDate as string),
                endDate: body.endDate ? new Date(body.endDate as string) : undefined,
                location: body.location as string | undefined,
                website: body.website as string | undefined,
                description: body.description as string | undefined,
                logoUrl: logoUrl as string | undefined,
                profileId: (body.profileId as string) || (await prisma.profile.findUnique({ where: { userId: user.id } }))?.id as string,
            },
        });

        return res.status(201).json(workExperience);
    } catch (error) {
        console.error("Error creating work experience:", error);
        return res.status(500).json({ error: "Failed to create work experience" });
    }
};

// GET /api/v1/work-experience/:id
export const getWorkExperienceById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const workExperience = await prisma.workExperience.findUnique({ where: { id: id as string } });
        if (!workExperience) return res.status(404).json({ error: "Work experience not found" });
        return res.json(workExperience);
    } catch (error) {
        console.error("Error fetching work experience:", error);
        return res.status(500).json({ error: "Failed to fetch work experience" });
    }
};

// PUT /api/v1/work-experience/:id
export const updateWorkExperience = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const body: any = req.body;
        let logoUrl = body.logoUrl;

        // Handle file upload
        if (req.file) {
            logoUrl = (req.file as any).path;
        }

        const workExperience = await prisma.workExperience.update({
            where: { id: id as string },
            data: {
                ...body,
                logoUrl: logoUrl as string | undefined,
            },
        });
        return res.json(workExperience);
    } catch (error) {
        console.error("Error updating work experience:", error);
        return res.status(500).json({ error: "Failed to update work experience" });
    }
};

// DELETE /api/v1/work-experience/:id
export const deleteWorkExperience = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.workExperience.delete({ where: { id: id as string } });
        return res.json({ message: "Work experience deleted successfully" });
    } catch (error) {
        console.error("Error deleting work experience:", error);
        return res.status(500).json({ error: "Failed to delete work experience" });
    }
};
