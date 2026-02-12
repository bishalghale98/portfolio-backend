// Extend Express Request type to include user property
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
                role: string;
            };
        }
    }
}

export { };
