import { Request, Response } from "express";
import { prisma } from "../../config/dbConnect";

// GET /api/v1/blog
export const getBlogPosts = async (req: Request, res: Response) => {
    try {
        const published = req.query.published === 'true';

        const where: any = {};
        if (published) {
            where.publishedAt = { not: null };
        }

        const blogPosts = await prisma.blogPost.findMany({
            where,
            include: {
                author: {
                    select: {
                        fullName: true,
                        avatarUrl: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return res.json(blogPosts);
    } catch (error) {
        console.error("Error fetching blog posts:", error);
        return res.status(500).json({ error: "Failed to fetch blog posts" });
    }
};

// POST /api/v1/blog
export const createBlogPost = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const body: any = req.body;
        let coverImage = body.coverImage;

        // Handle file upload
        if (req.file) {
            coverImage = (req.file as any).path;
        }

        // Get profile id for authorId
        const profile = await prisma.profile.findUnique({
            where: { userId: user.id },
        });

        if (!profile) {
            return res.status(400).json({ error: "Profile not found for user" });
        }

        const blogPost = await prisma.blogPost.create({
            data: {
                title: body.title as string,
                slug: body.slug as string,
                content: body.content as string,
                summary: body.summary as string | undefined,
                publishedAt: body.publishedAt ? new Date(body.publishedAt as string) : undefined,
                coverImage: coverImage as string | undefined,
                authorId: profile.id,
                tags: typeof body.tags === 'string' ? JSON.parse(body.tags) : (body.tags || []),
            },
            include: {
                author: {
                    select: {
                        fullName: true,
                        avatarUrl: true,
                    },
                },
            },
        });

        return res.status(201).json(blogPost);
    } catch (error) {
        console.error("Error creating blog post:", error);
        return res.status(500).json({ error: "Failed to create blog post" });
    }
};

// GET /api/v1/blog/:slug
export const getBlogPostBySlug = async (req: Request, res: Response) => {
    try {
        const { slug } = req.params;
        const blogPost = await prisma.blogPost.findUnique({
            where: { slug: slug as string },
            include: {
                author: {
                    select: {
                        fullName: true,
                        avatarUrl: true,
                    },
                },
            },
        });
        if (!blogPost) return res.status(404).json({ error: "Blog post not found" });
        return res.json(blogPost);
    } catch (error) {
        console.error("Error fetching blog post:", error);
        return res.status(500).json({ error: "Failed to fetch blog post" });
    }
};

// PUT /api/v1/blog/:id
export const updateBlogPost = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const body: any = req.body;
        let coverImage = body.coverImage;

        // Handle file upload
        if (req.file) {
            coverImage = (req.file as any).path;
        }

        const blogPost = await prisma.blogPost.update({
            where: { id: id as string },
            data: {
                ...body,
                coverImage: coverImage as string | undefined,
                tags: typeof body.tags === 'string' ? JSON.parse(body.tags) : body.tags,
            },
        });
        return res.json(blogPost);
    } catch (error) {
        console.error("Error updating blog post:", error);
        return res.status(500).json({ error: "Failed to update blog post" });
    }
};

// DELETE /api/v1/blog/:id
export const deleteBlogPost = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.blogPost.delete({ where: { id: id as string } });
        return res.json({ message: "Blog post deleted successfully" });
    } catch (error) {
        console.error("Error deleting blog post:", error);
        return res.status(500).json({ error: "Failed to delete blog post" });
    }
};
