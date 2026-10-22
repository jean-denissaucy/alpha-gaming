// middlewares/auth.middleware.js
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { isDatabaseError } from '../config/db.js';
import { buildErrorResponse } from '../utils/response.js';

const getConfiguredAdminEmails = () => (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

const resolveEffectiveRole = (user) => {
    if (!user) return 'user';

    const email = String(user.email || '').trim().toLowerCase();
    if (user.role === 'admin' || getConfiguredAdminEmails().includes(email)) {
        return 'admin';
    }

    return user.role || 'user';
};

// Vérifie la présence et la validité du JWT dans l'en-tête Authorization.
const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json(buildErrorResponse('Token manquant ou format invalide', 401));
        }

        const token = authHeader.slice(7).trim();
        if (!token) {
            return res.status(401).json(buildErrorResponse('Token manquant ou format invalide', 401));
        }

        const jwtSecret = process.env.JWT_SECRET || process.env.JTW_secret;
        if (!jwtSecret) {
            console.error('JWT_SECRET manquant côté serveur');
            return res.status(500).json(buildErrorResponse('Erreur de configuration serveur', 500));
        }

        const decoded = jwt.verify(token, jwtSecret);
        if (!decoded || typeof decoded !== 'object' || !decoded.id) {
            return res.status(401).json(buildErrorResponse('Token invalide', 401));
        }

        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json(buildErrorResponse('Utilisateur non trouvé', 401));
        }

        req.user = {
            ...user,
            role: resolveEffectiveRole(user)
        };
        return next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json(buildErrorResponse('Token expiré', 401));
        }

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json(buildErrorResponse('Token invalide', 401));
        }

        console.error('Erreur middleware authentification:', error);
        if (isDatabaseError(error)) {
            return res.status(503).json(buildErrorResponse('Base de données indisponible ou mal configurée', 503));
        }

        return res.status(500).json(buildErrorResponse('Erreur serveur', 500));
    }
};
export default authMiddleware;