import { buildErrorResponse } from '../utils/response.js';

export default function adminMiddleware(req, res, next) {
    const configuredAdmins = (process.env.ADMIN_EMAILS || '')
        .split(',')
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean);
    const email = String(req.user?.email || '').trim().toLowerCase();

    if (!email || configuredAdmins.length === 0 || !configuredAdmins.includes(email)) {
        return res.status(403).json(buildErrorResponse('Accès administrateur requis', 403));
    }

    return next();
}
