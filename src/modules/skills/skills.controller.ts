import { Request, Response } from "express";
import { prisma } from "../../config/dbConnect";

// GET /api/v1/skills
export const getSkills = async (_req: Request, res: Response) => {
    try {
        const skills = await prisma.skill.findMany({
            orderBy: { name: "asc" },
        });

        return res.json(skills);
    } catch (error) {
        console.error("Error fetching skills:", error);
        return res.status(500).json({ error: "Failed to fetch skills" });
    }
};

// POST /api/v1/skills
export const createSkill = async (req: Request, res: Response) => {
    try {
        const { name, category } = req.body;

        if (!name) {
            return res.status(400).json({ error: "Name is required" });
        }

        const existingSkill = await prisma.skill.findUnique({
            where: { name },
        });

        if (existingSkill) {
            return res.status(409).json({ error: "Skill already exists" });
        }

        const skill = await prisma.skill.create({
            data: { name, category },
        });

        return res.status(201).json(skill);
    } catch (error) {
        console.error("Error creating skill:", error);
        return res.status(500).json({ error: "Failed to create skill" });
    }
};
