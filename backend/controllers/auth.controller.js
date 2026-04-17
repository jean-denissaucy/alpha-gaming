// controllers/auth.controller.js
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

const normalizeUser = (user) => {
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
        created_at: user.created_at
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
        { id: user.id, email: user.email },
        jwtSecret,
        { expiresIn: jwtExpiresIn }
    );
};
// POST /api/auth/register
export const register = async (req, res) => {
    try {
        const { email, password, firstname, lastname } = req.body;
        if (!email || !password || !firstname || !lastname) {
            return res.status(400).json({ error: 'Tous les champs sont requis' });
        }
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(409).json({ error: 'Email déjà utilisé' });
        }
        const user = await User.create({ email, password, firstname, lastname });
        const normalizedUser = normalizeUser(user);
        const token = generateToken(normalizedUser);
        res.status(201).json({ message: 'Inscription réussie', user: normalizedUser, token });
    } catch (error) {
        console.error('Erreur register:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};
// POST /api/auth/login
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findByEmail(email);
        if (!user || !(await User.verifyPassword(password, user.password))) {
            return res.status(401).json({ error: 'Identifiants incorrects' });
        }
        const normalizedUser = normalizeUser(user);
        const token = generateToken(normalizedUser);
        res.json({
            user: normalizedUser,
            token
        });
    } catch (error) {
        console.error('Erreur login:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};
// GET /api/auth/me
export const getProfile = async (req, res) => {
    res.json({ user: normalizeUser(req.user) });
};