import { Request, Response } from "express";
import { prisma } from "../../config/dbConnect";

// GET /api/v1/projects
export const getProjects = async (req: Request, res: Response) => {
    try {
        const featured = req.query.featured === 'true';
        const active = req.query.active === 'true';

        const where: any = {};
        if (featured) where.isFeatured = true;
        if (active) where.isActive = true;

        const projects = await prisma.project.findMany({
            where,
            include: {
                projectSkills: {
                    include: {
                        skill: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return res.json(projects);
    } catch (error) {
        console.error("Error fetching projects:", error);
        return res.status(500).json({ error: "Failed to fetch projects" });
    }
};

// GET /api/v1/projects/:id
export const getProject = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const project = await prisma.project.findUnique({
            where: { id: id as string },
            include: {
                projectSkills: {
                    include: {
                        skill: true,
                    },
                },
            },
        });

        if (!project) {
            return res.status(404).json({ error: "Project not found" });
        }

        return res.json(project);
    } catch (error) {
        console.error("Error fetching project:", error);
        return res.status(500).json({ error: "Failed to fetch project" });
    }
};

// POST /api/v1/projects
export const createProject = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const body: any = req.body;
        // Handle multipart/form-data where array fields might be JSON strings or individual items
        // If technologies is sent as stringified JSON in formData
        let { technologies, ...projectData } = body;

        if (typeof technologies === 'string') {
            try {
                technologies = JSON.parse(technologies);
            } catch (e) {
                technologies = [];
            }
        }

        // Handle file upload
        let imageUrl = projectData.imageUrl;
        if (req.file) {
            imageUrl = (req.file as any).path;
        }

        // Create project
        const project = await prisma.project.create({
            data: {
                ...projectData,
                imageUrl,
                profileId: projectData.profileId || (await prisma.profile.findUnique({ where: { userId: user.id } }))?.id,
                tags: technologies && Array.isArray(technologies) ? technologies : [],
            },
        });

        // Link technologies
        if (technologies && Array.isArray(technologies) && technologies.length > 0) {
            for (const techName of technologies) {
                let skill = await prisma.skill.findUnique({
                    where: { name: techName },
                });

                if (!skill) {
                    skill = await prisma.skill.create({
                        data: { name: techName },
                    });
                }

                await prisma.projectSkill.create({
                    data: {
                        projectId: project.id,
                        skillId: skill.id,
                    },
                });
            }
        }

        const completeProject = await prisma.project.findUnique({
            where: { id: project.id },
            include: {
                projectSkills: { include: { skill: true } },
            },
        });

        return res.status(201).json(completeProject);
    } catch (error) {
        console.error("Error creating project:", error);
        return res.status(500).json({ error: "Failed to create project" });
    }
};

// PUT /api/v1/projects/:id
export const updateProject = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const { id } = req.params;
        const body: any = req.body;
        let { technologies, ...projectData } = body;

        // Handle stringified technologies in FormData
        if (typeof technologies === 'string') {
            try {
                technologies = JSON.parse(technologies);
            } catch (e) {
                technologies = [];
            }
        }

        // Handle file upload
        if (req.file) {
            const file = req.file as any;
            projectData.imageUrl = file.path;

            // Optionally delete old image
            /*
            const oldProject = await prisma.project.findUnique({ where: { id } });
            if (oldProject?.imageUrl && oldProject.imageUrl.includes('cloudinary')) {
                // extract public id and delete
            }
            */
        }

        const project = await prisma.project.update({
            where: { id: id as string },
            data: projectData,
        });

        // Update technologies if provided
        if (technologies && Array.isArray(technologies)) {
            // Remove existing skills
            await prisma.projectSkill.deleteMany({
                where: { projectId: id as string },
            });

            // Add new skills
            for (const techName of technologies) {
                let skill = await prisma.skill.findUnique({
                    where: { name: techName },
                });

                if (!skill) {
                    skill = await prisma.skill.create({
                        data: { name: techName },
                    });
                }

                await prisma.projectSkill.create({
                    data: {
                        projectId: project.id,
                        skillId: skill.id,
                    },
                });
            }
        }

        const completeProject = await prisma.project.findUnique({
            where: { id: id as string },
            include: {
                projectSkills: { include: { skill: true } },
            },
        });

        return res.json(completeProject);

    } catch (error) {
        console.error("Error updating project:", error);
        return res.status(500).json({ error: "Failed to update project" });
    }
};

// DELETE /api/v1/projects/:id
export const deleteProject = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const { id } = req.params;

        await prisma.project.delete({
            where: { id: id as string },
        });

        return res.json({ message: "Project deleted successfully" });
    } catch (error) {
        console.error("Error deleting project:", error);
        return res.status(500).json({ error: "Failed to delete project" });
    }
};
