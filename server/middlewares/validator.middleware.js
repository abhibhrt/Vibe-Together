import { ZodError } from 'zod';

export const validateRequest = (schema) => (req, res, next) => {
    try {
        const validatedData = schema.parse(req.body);
        req.parsed = validatedData;
        next();
    } catch (err) {
        if (err instanceof ZodError) {
            const errors = err.errors.map(e => ({
                path: e.path.join('.'),
                message: e.message.toLowerCase()
            }));
            return res.status(400).json({
                success: false,
                message: 'validation failed',
                errors
            });
        }

        console.error('validation middleware error:', err);
        return res.status(500).json({
            success: false,
            message: 'internal server error'
        });
    }
};