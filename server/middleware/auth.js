import { supabase } from '../supabase.js';

export async function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
        return res.status(403).json({ error: 'Invalid or expired token.' });
    }

    req.user = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name || data.user.email?.split('@')[0]
    };

    next();
}

export async function optionalAuth(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
        const { data, error } = await supabase.auth.getUser(token);

        if (!error && data.user) {
            req.user = {
                id: data.user.id,
                email: data.user.email,
                name: data.user.user_metadata?.name || data.user.email?.split('@')[0]
            };
        }
    }

    next();
}

export const JWT_SECRET = 'supabase-handles-jwt-now';


