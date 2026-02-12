import 'dotenv/config'; // Load environment variables first
import { prisma } from '../src/config/dbConnect';
import bcrypt from 'bcrypt';



async function main() {
    console.log('🌱 Starting database seed...');

    const email = process.env.ADMIN_EMAIL!;
    const password = process.env.ADMIN_PASSWORD!;
    // Create admin user
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.upsert({
        where: { email: email },
        update: {
            password: hashedPassword,
        },
        create: {
            email: email,
            name: 'Bishal Ghale',
            password: hashedPassword,
        },
    });

    console.log('✅ User created:', user.email);

    // Create profile
    const profile = await prisma.profile.upsert({
        where: { slug: 'bishal-ghale' },
        update: {
            fullName: 'Bishal Ghale',
            headline: 'I am a passionate and detail-oriented web developer specializing in creating responsive, user-friendly, and scalable web applications using modern front-end and back-end technologies.',
            location: 'Biratnagar, Nepal',
            locationLink: 'https://google.com/maps/place/Biratnagar',
            avatarUrl: '/profile.jpeg',
            shortBio: 'A passionate web developer from Nepal, specializing in responsive front-end design using React.js, Tailwind CSS, and Bootstrap, as well as scalable back-end solutions with Laravel. I create mobile-first, user-friendly web applications and have worked on projects like an Online Course Management System and a News Portal.',
            email: 'bishalghle@gmail.com',
            telephone: '+9779823733501',
        },
        create: {
            slug: 'bishal-ghale',
            fullName: 'Bishal Ghale',
            headline: 'I am a passionate and detail-oriented web developer specializing in creating responsive, user-friendly, and scalable web applications using modern front-end and back-end technologies.',
            location: 'Biratnagar, Nepal',
            locationLink: 'https://google.com/maps/place/Biratnagar',
            avatarUrl: '/profile.jpeg',
            shortBio: 'A passionate web developer from Nepal, specializing in responsive front-end design using React.js, Tailwind CSS, and Bootstrap, as well as scalable back-end solutions with Laravel. I create mobile-first, user-friendly web applications and have worked on projects like an Online Course Management System and a News Portal.',
            email: 'bishalghle@gmail.com',
            telephone: '+9779823733501',
            userId: user.id,
        },
    });

    console.log('✅ Profile created:', profile.fullName);

    // Create skills
    const skillsData = [
        { name: 'React', category: 'Frontend' },
        { name: 'Node.js', category: 'Backend' },
        { name: 'Laravel', category: 'Backend' },
        { name: 'Tailwind CSS', category: 'Frontend' },
        { name: 'Bootstrap', category: 'Frontend' },
        { name: 'MySQL', category: 'Database' },
        { name: 'MongoDB', category: 'Database' },
    ];

    const skills = [];
    for (const skillData of skillsData) {
        const skill = await prisma.skill.upsert({
            where: { name: skillData.name },
            update: {},
            create: skillData,
        });
        skills.push(skill);
    }

    console.log(`✅ Created ${skills.length} skills`);

    // Link skills to profile
    for (let i = 0; i < skills.length; i++) {
        await prisma.profileSkill.upsert({
            where: {
                profileId_skillId: {
                    profileId: profile.id,
                    skillId: skills[i].id,
                },
            },
            update: {},
            create: {
                profileId: profile.id,
                skillId: skills[i].id,
                sortOrder: i,
            },
        });
    }

    console.log('✅ Linked skills to profile');

    // Create social links
    const socialLinksData = [
        {
            platform: 'GitHub',
            url: 'https://github.com/bishalghale98',
            icon: 'github',
            navbar: true,
            sortOrder: 0,
        },
        {
            platform: 'LinkedIn',
            url: 'https://www.linkedin.com/in/bishal-ghale-54432631b/',
            icon: 'linkedin',
            navbar: true,
            sortOrder: 1,
        },
        {
            platform: 'X',
            url: 'https://dub.sh/dillion-twitter',
            icon: 'x',
            navbar: false,
            sortOrder: 2,
        },
        {
            platform: 'Youtube',
            url: 'https://dub.sh/dillion-youtube',
            icon: 'youtube',
            navbar: false,
            sortOrder: 3,
        },
        {
            platform: 'Email',
            url: 'mailto:bishalghle@gmail.com',
            icon: 'email',
            navbar: true,
            sortOrder: 4,
        },
    ];

    for (const socialLink of socialLinksData) {
        await prisma.socialLink.create({
            data: {
                ...socialLink,
                profileId: profile.id,
            },
        });
    }

    console.log(`✅ Created ${socialLinksData.length} social links`);

    // Create education
    const educationData = [
        {
            institution: 'Janasewa Higher Secondary School',
            degree: 'High School, SEE',
            logoUrl: '/janasewa.webp',
            startDate: new Date('2006-01-01'),
            endDate: new Date('2019-12-31'),
        },
        {
            institution: 'Redstar English Boarding School',
            degree: '+2, Management, Business, and Economics',
            logoUrl: '/Redstar-english.jpg',
            startDate: new Date('2019-01-01'),
            endDate: new Date('2021-12-31'),
        },
        {
            institution: 'Mahendra Morang Adarsh Multiple Campus',
            degree: "Bachelor's Of Computer Applications (BCA)",
            logoUrl: '/mmamc.png',
            startDate: new Date('2024-01-01'),
            endDate: null, // Currently running
        },
    ];

    for (const education of educationData) {
        await prisma.education.create({
            data: {
                ...education,
                profileId: profile.id,
            },
        });
    }

    console.log(`✅ Created ${educationData.length} education entries`);

    // Create projects
    const projectsData = [
        {
            title: 'Ecommerce Frontend',
            slug: 'ecommerce-frontend',
            description: 'Developed an ecommerce frontend using React.js, Tailwind CSS, and Bootstrap. The frontend allows users to view products, add products to cart, and checkout.',
            websiteUrl: 'https://frontendproject-lovat.vercel.app/',
            repoUrl: 'https://github.com/bishalghale98/frontendproject',
            imageUrl: '/EcommerceFrontend.png',
            tags: ['React.js', 'Tailwind CSS', 'Bootstrap', 'HTML', 'CSS', 'JavaScript'],
            startDate: new Date('2023-12-01'),
            endDate: new Date('2024-01-31'),
            isActive: true,
            isFeatured: true,
            technologies: ['React.js', 'Tailwind CSS', 'Bootstrap', 'HTML', 'CSS', 'JavaScript'],
        },
        {
            title: 'LMS Frontend',
            slug: 'lms-frontend',
            description: 'The frontend of this project is built using React and styled with Tailwind CSS. It connects with the backend APIs to perform full CRUD operations (Create, Read, Update, Delete) on books.',
            websiteUrl: 'https://basic-react-rho.vercel.app/',
            repoUrl: 'https://github.com/bishalghale98/Basic-React',
            imageUrl: '/LMSFrontend.png',
            startDate: new Date('2025-03-01'),
            tags: ['React.js', 'React Router DOM', 'Tailwind CSS', 'Vite', 'Axios', 'JSX', 'Babel', 'Vercel'],
            endDate: new Date('2025-04-30'),
            isActive: true,
            isFeatured: true,
            technologies: ['React.js', 'React Router DOM', 'Tailwind CSS', 'Vite', 'Axios', 'JSX', 'Babel', 'Vercel'],
        },
        {
            title: 'LMS Backend',
            slug: 'lms-backend',
            description: 'The backend of this project is built using Node.js, Express.js, and MongoDB Atlas. It provides a set of RESTful APIs that allow the frontend to perform full CRUD operations on books, including image upload and management.',
            websiteUrl: 'https://learning-mern2-0.onrender.com/',
            repoUrl: 'https://github.com/bishalghale98/Learning-MERN2.0',
            imageUrl: '/LMSBackend.png',
            startDate: new Date('2025-03-01'),
            tags: ['Node.js', 'Express.js', 'MongoDB Atlas', 'Mongoose', 'Multer', 'Nodemon', 'CORS', 'Dotenv', 'Render'],
            endDate: new Date('2025-04-30'),
            isActive: true,
            isFeatured: true,
            technologies: ['Node.js', 'Express.js', 'MongoDB Atlas', 'Mongoose', 'Multer', 'Nodemon', 'CORS', 'Dotenv', 'Render'],
        },
        {
            title: 'Anonymous Message App',
            slug: 'anonymous-message-app',
            description: 'Developed an anonymous messaging web app where users can receive and reply to anonymous messages. Integrated Grok AI API for smart responses and used Next.js for both frontend and backend routes.',
            websiteUrl: 'https://sayit-flax.vercel.app/',
            videoUrl: 'https://res.cloudinary.com/dqifulrhz/video/upload/v1763003241/anonymous-message_qk0qzu.mp4',
            startDate: new Date('2025-11-01'),
            tags: ['Next.js', 'React', 'Tailwind CSS', 'MongoDB', 'TypeScript', 'Grok AI API', 'ShadCN/UI'],
            endDate: new Date('2025-11-30'),
            isActive: true,
            isFeatured: true,
            technologies: ['Next.js', 'React', 'Tailwind CSS', 'MongoDB', 'TypeScript', 'Grok AI API', 'ShadCN/UI'],
        },
    ];

    for (const projectData of projectsData) {
        const { technologies, ...projectInfo } = projectData;

        const project = await prisma.project.create({
            data: {
                ...projectInfo,
                tags: technologies, // Add tags field with technologies array
                profileId: profile.id,
            },
        });

        // Link technologies to project
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

    console.log(`✅ Created ${projectsData.length} projects with technologies`);

    console.log('🎉 Database seeding completed successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
