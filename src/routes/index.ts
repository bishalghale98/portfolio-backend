import { Router } from 'express';
import userRouter from '../modules/user/user.route';
import userManagementRouter from '../modules/user-management/user.route';
import profileRouter from '../modules/profile/profile.route';
import skillsRouter from '../modules/skills/skills.route';
import projectsRouter from '../modules/projects/projects.route';
import educationRouter from '../modules/education/education.route';
import workExperienceRouter from '../modules/work-experience/work-experience.route';
import socialLinksRouter from '../modules/social-links/social-links.route';
import blogRouter from '../modules/blog/blog.route';

// Create main router
const mainRouter = Router();

// Register module routes
mainRouter.use('/users', userRouter);
mainRouter.use('/admin/users', userManagementRouter);
mainRouter.use('/profile', profileRouter);
mainRouter.use('/skills', skillsRouter);
mainRouter.use('/projects', projectsRouter);
mainRouter.use('/education', educationRouter);
mainRouter.use('/work-experience', workExperienceRouter);
mainRouter.use('/social-links', socialLinksRouter);
mainRouter.use('/blog', blogRouter);

// Add more module routes here as you build them
// Example:
// mainRouter.use('/products', productRouter);
// mainRouter.use('/categories', categoryRouter);
// mainRouter.use('/cart', cartRouter);

export default mainRouter;
