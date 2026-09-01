// controllers/auth.controller.js
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { resolveUserFavoriteGames } from '../utils/favorites.js';
import { isDatabaseError } from '../config/db.js';
import { buildErrorResponse, buildSuccessResponse } from '../utils/response.js';

const normalizeUser = (user, favoriteGames = []) => {
    if (!user) return null;

    const fullName = (user.name || '').trim();
    const parts = fullName ? fullName.split(/\s+/) : [];
    const firstname = user.firstname || parts[0] || '';
    const lastname = user.lastname || (parts.length > 1 ? parts.slice(1).join(' ') : '');

    return {
        id: user.id,
        email: user.email,
        firstname,
        lastname,
        role: user.role || 'user',
        created_at: user.created_at,
        favorite_games: favoriteGames
    };
};

// Génère un token JWT
const generateToken = (user) => {
    const jwtSecret = process.env.JWT_SECRET || process.env.JTW_secret;
    const jwtExpiresIn = process.env.JWT_EXPIRES_IN || process.env.JTW_EXPIRES_IN || '7d';

    if (!jwtSecret) {
        throw new Error('JWT_SECRET manquant dans les variables d\'environnement');
    }

    return jwt.sign(
        { id: user.id, email: user.email, role: user.role || 'user' },
        jwtSecret,
        { expiresIn: jwtExpiresIn }
    );
};
// POST /api/auth/register
export const register = async (req, res) => {
    try {
        const { email, password, firstname, lastname } = req.body;
        if (!email || !password || !firstname || !lastname) {
            return res.status(400).json(buildErrorResponse('Tous les champs sont requis', 400));
        }
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(409).json(buildErrorResponse('Email déjà utilisé', 409));
        }
        const user = await User.create({ email, password, firstname, lastname });
        const normalizedUser = normalizeUser(user);
        const token = generateToken(normalizedUser);
        return res.status(201).json(buildSuccessResponse({ message: 'Inscription réussie', user: normalizedUser }, { user: normalizedUser, token }));
    } catch (error) {
        console.error('Erreur register:', error.code || 'UNKNOWN', error.message);
        if (isDatabaseError(error)) {
            return res.status(503).json(buildErrorResponse('Base de données indisponible ou mal configurée', 503));
        }
        return res.status(500).json(buildErrorResponse('Erreur serveur', 500));
    }
};
// POST /api/auth/login
export const login = async (req, res) => {
    try {
        const { email, password } = req.body || {};
        if (!email || !password) {
            return res.status(400).json(buildErrorResponse('Email et mot de passe sont requis', 400));
        }
        const user = await User.findByEmail(email);
        if (!user || !(await User.verifyPassword(password, user.password))) {
            return res.status(401).json(buildErrorResponse('Identifiants incorrects', 401));
        }
        const normalizedUser = normalizeUser(user);
        const token = generateToken(normalizedUser);
        return res.json(buildSuccessResponse({ message: 'Connexion réussie' }, { user: normalizedUser, token }));
    } catch (error) {
        console.error('Erreur login:', error.code || 'UNKNOWN', error.message);
        if (isDatabaseError(error)) {
            return res.status(503).json(buildErrorResponse('Base de données indisponible ou mal configurée', 503));
        }
        return res.status(500).json(buildErrorResponse('Erreur serveur', 500));
    }
};
// GET /api/auth/me
export const getProfile = async (req, res) => {
    try {
        const [userFavoriteGames, allFavoriteGames] = await Promise.all([
            User.findFavoriteGamesByUserId(req.user.id),
            User.findAllFavoriteGames()
        ]);
        const favoriteGames = resolveUserFavoriteGames(userFavoriteGames, allFavoriteGames);

        return res.json(buildSuccessResponse({ user: normalizeUser(req.user, favoriteGames) }));
    } catch (error) {
        console.error('Erreur getProfile:', error);
        return res.status(500).json(buildErrorResponse('Erreur serveur', 500));
    }
};