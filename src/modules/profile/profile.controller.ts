import { Request, Response } from "express";
import { prisma } from "../../config/dbConnect";
import cloudinary from "../../config/cloudinary";
import { errorResponse, successResponse } from "../../utils/apiResponse";

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
            return errorResponse({ res, message: 'Profile not found' });
        }

        return successResponse({ res, data: profile, message: "Profile fetched successfully" });
    } catch (error) {
        console.error("Error fetching profile:", error);
        return errorResponse({ res, message: "Failed to fetch profile" });
    }
};



// POST /api/profile
export const createProfile = async (req: Request, res: Response) => {
    try {
        const user = req.user; // from auth middleware (JWT/session)




        if (!req.file) {
            return errorResponse({ res, message: 'No file uploaded' });
        }

        // Get Cloudinary file info
        const file = req.file as Express.Multer.File & {
            path: string;
            filename: string;
        };

        // Get user's current avatar to delete old one
        const existingProfile = await prisma.profile.findUnique({
            where: { userId: user?.id },
        });

        if (existingProfile) {
            return errorResponse({ res, message: 'Profile already exists' });
        }


        const body = req.body;

        const profile = await prisma.profile.create({
            data: {
                ...body,
                avatarUrl: file.path,
                avatarPublicId: file.filename,
                userId: user?.id,
            },
        });

        return successResponse({ res, data: profile, message: "Profile created successfully" })
    } catch (error) {
        console.error("Error creating profile:", error);
        return errorResponse({ res, message: "Failed to create profile" });
    }
};



// PUT /api/profile
export const updateProfile = async (req: Request, res: Response) => {
    try {
        const user = req.user;

        const file = req.file as Express.Multer.File & {
            path: string;
            filename: string;
        };

        const existingProfile = await prisma.profile.findUnique({
            where: { userId: user?.id },
            select: {
                avatarPublicId: true,
            }
        });


        // Delete old avatar from Cloudinary if exists
        if (existingProfile?.avatarPublicId && file) {
            try {
                await cloudinary.uploader.destroy(existingProfile.avatarPublicId);
            } catch (error) {
                console.error('Failed to delete old avatar:', error);
            }
        }

        const { slug, ...updateData } = req.body;


        const profile = await prisma.profile.update({
            where: { userId: user?.id },
            data: {
                ...updateData,
                ...(file && {
                    avatarUrl: file.path,
                    avatarPublicId: file.filename,
                }),
            },
        });

        return successResponse({ res, data: profile, message: "Profile updated successfully" });
    } catch (error) {
        console.error("Error updating profile:", error);
        return errorResponse({ res, message: "Failed to update profile" });
    }
};



// DELETE /api/profile?slug=bishal-ghale
export const deleteProfile = async (req: Request, res: Response) => {
    try {
        const user = req.user;

        if (!user) {
            return errorResponse({ res, message: "Unauthorized" });
        }

        const slug = req.query.slug as string;

        if (!slug) {
            return errorResponse({ res, message: "Slug is required" });
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

        return successResponse({ res, message: "Profile deleted successfully" });
    } catch (error) {
        console.error("Error deleting profile:", error);
        return errorResponse({ res, message: "Failed to delete profile" });
    }
};
