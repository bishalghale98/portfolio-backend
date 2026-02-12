import { Request, Response } from "express";
import { prisma } from "../../config/dbConnect";
import cloudinary from "../../config/cloudinary";

// GET /api/profile?slug=bishal-ghale
export const getProfile = async (req: Request, res: Response) => {
    try {
        const slug = (req.query.slug as string) || "bishal-ghale";

        const profile = await prisma.profile.findUnique({
            where: { slug },
            include: {
                socialLinks: {
                    orderBy: { sortOrder: "asc" },
                },
                workExperience: {
                    orderBy: { startDate: "desc" },
                },
                education: {
                    orderBy: { startDate: "desc" },
                },
                projects: {
                    where: { isActive: true },
                    orderBy: { createdAt: "desc" },
                    include: {
                        projectSkills: {
                            include: {
                                skill: true,
                            },
                        },
                    },
                },
                profileSkills: {
                    orderBy: { sortOrder: "asc" },
                    include: {
                        skill: true,
                    },
                },
            },
        });

        if (!profile) {
            return res.status(404).json({ error: "Profile not found" });
        }

        return res.json(profile);
    } catch (error) {
        console.error("Error fetching profile:", error);
        return res.status(500).json({ error: "Failed to fetch profile" });
    }
};



// POST /api/profile
export const createProfile = async (req: Request, res: Response) => {
    try {
        const user = req.user; // from auth middleware (JWT/session)

        if (!user) {
            return res.status(401).json({ error: "Unauthorized" });
        }



        if (!req.file) {
            res.status(400).json({
                success: false,
                message: 'No file uploaded',
            });
            return;
        }

        // Get Cloudinary file info
        const file = req.file as Express.Multer.File & {
            path: string;
            filename: string;
        };

        // Get user's current avatar to delete old one
        const existingProfile = await prisma.profile.findUnique({
            where: { userId: user.id },
        });

        if (existingProfile) {
            return res.status(400).json({
                success: false,
                message: 'Profile already exists',
            });
        }


        const body = req.body;

        const profile = await prisma.profile.create({
            data: {
                ...body,
                avatar: file.path,
                avatarPublicId: file.filename,
                userId: user.id,
            },
        });

        return res.status(201).json(profile);
    } catch (error) {
        console.error("Error creating profile:", error);
        return res.status(500).json({ error: "Failed to create profile" });
    }
};



// PUT /api/profile
export const updateProfile = async (req: Request, res: Response) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(401).json({ error: "Unauthorized" });
        }


        const file = req.file as Express.Multer.File & {
            path: string;
            filename: string;
        };

        const existingProfile = await prisma.profile.findUnique({
            where: { userId: user.id },
            select: {
                avatarPublicId: true,
            }
        });

        // Delete old avatar from Cloudinary if exists
        if (existingProfile?.avatarPublicId) {
            try {
                await cloudinary.uploader.destroy(existingProfile.avatarPublicId);
            } catch (error) {
                // Log error but don't fail the upload
                console.error('Failed to delete old avatar:', error);
            }
        }

        const { slug, ...updateData } = req.body;

        const profile = await prisma.profile.update({
            where: { slug },
            data: {
                ...updateData,
                avatar: file?.path,
                avatarPublicId: file?.filename,
            },
        });

        return res.json(profile);
    } catch (error) {
        console.error("Error updating profile:", error);
        return res.status(500).json({ error: "Failed to update profile" });
    }
};



// DELETE /api/profile?slug=bishal-ghale
export const deleteProfile = async (req: Request, res: Response) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const slug = req.query.slug as string;

        if (!slug) {
            return res.status(400).json({ error: "Slug is required" });
        }

        const existingProfile = await prisma.profile.findUnique({
            where: { slug },
            select: {
                avatarPublicId: true,
            }
        });

        // Delete old avatar from Cloudinary if exists
        if (existingProfile?.avatarPublicId) {
            try {
                await cloudinary.uploader.destroy(existingProfile.avatarPublicId);
            } catch (error) {
                // Log error but don't fail the upload
                console.error('Failed to delete old avatar:', error);
            }
        }

        await prisma.profile.delete({
            where: { slug },
        });

        return res.json({ message: "Profile deleted successfully" });
    } catch (error) {
        console.error("Error deleting profile:", error);
        return res.status(500).json({ error: "Failed to delete profile" });
    }
};
