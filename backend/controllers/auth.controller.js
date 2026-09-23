// controllers/auth.controller.js
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { isDatabaseError } from '../config/db.js';
import { buildErrorResponse, buildSuccessResponse } from '../utils/response.js';
import { validateRegistration, validatePasswordChange } from '../utils/validation.js';


// Emails promus administrateurs via la variable d'environnement ADMIN_EMAILS.
// Doit rester STRICTEMENT identique à la logique de middlewares/admin.middleware.js :
// le frontend doit voir le même rôle que celui que le backend applique réellement.
const getConfiguredAdminEmails = () => (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);


// Rôle effectif : admin si le rôle SQL est 'admin' OU si l'email est dans ADMIN_EMAILS.
const resolveRole = (user) => {
    if (!user) return 'user';
    const email = String(user.email || '').trim().toLowerCase();
    if (user.role === 'admin' || getConfiguredAdminEmails().includes(email)) return 'admin';
    return user.role || 'user';
};


// Normalise les données utilisateur pour uniformiser le format renvoyé au frontend.
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
        role: resolveRole(user),
        created_at: user.created_at,
        favorite_games: favoriteGames
    };
};


// Génère un token JWT signé avec le secret de l'application pour sécuriser les sessions.
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
// Crée un compte utilisateur, vérifie l'unicité de l'email puis renvoie le token d'authentification.
export const register = async (req, res) => {
    try {
        // Validation serveur systématique : le frontend valide déjà, mais on ne fait jamais confiance
        // aux données reçues (format email, longueur du mot de passe, tailles des champs).
        const validation = validateRegistration(req.body || {});
        if (!validation.isValid) {
            return res.status(400).json(buildErrorResponse(validation.errors.join(' '), 400));
        }
        const { email, password, firstname, lastname } = validation.values;


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
// Vérifie les identifiants et renvoie le token JWT si la connexion est valide.
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
// Récupère le profil de l'utilisateur authentifié et ses jeux favoris.
export const getProfile = async (req, res) => {
    try {
        const favoriteGames = await User.findFavoriteGamesByUserId(req.user.id);
        return res.json(buildSuccessResponse({ user: normalizeUser(req.user, favoriteGames) }));
    } catch (error) {
        console.error('Erreur getProfile:', error);
        return res.status(500).json(buildErrorResponse('Erreur serveur', 500));
    }
};


// PUT /api/auth/password
// Change le mot de passe de l'utilisateur connecté : vérifie l'ancien, hache le nouveau (bcrypt).
export const changePassword = async (req, res) => {
    try {
        const validation = validatePasswordChange(req.body || {});
        if (!validation.isValid) {
            return res.status(400).json(buildErrorResponse(validation.errors.join(' '), 400));
        }
        const { currentPassword, newPassword } = validation.values;


        // req.user (posé par authMiddleware) ne contient pas le hash : requête dédiée.
        const passwordHash = await User.findPasswordHashById(req.user.id);
        if (!passwordHash || !(await User.verifyPassword(currentPassword, passwordHash))) {
            return res.status(401).json(buildErrorResponse('Mot de passe actuel incorrect', 401));
        }

        const updated = await User.updatePasswordById(req.user.id, newPassword);
        if (!updated) {
            return res.status(500).json(buildErrorResponse('Impossible de mettre à jour le mot de passe', 500));
        }
        return res.json(buildSuccessResponse({ message: 'Mot de passe modifié avec succès' }));
    } catch (error) {
        console.error('Erreur changePassword:', error.code || 'UNKNOWN', error.message);
        if (isDatabaseError(error)) {
            return res.status(503).json(buildErrorResponse('Base de données indisponible ou mal configurée', 503));
        }
        return res.status(500).json(buildErrorResponse('Erreur serveur', 500));
    }
};