// routes/auth.routes.js
import { Router } from 'express';
import { register, login, getProfile, changePassword } from '../controllers/auth.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
const router = Router();

// Routes publiques pour l'inscription et la connexion.
router.post('/register', register);
router.post('/login', login);

// Route protégée : retourne le profil de l'utilisateur connecté.
router.get('/me', authMiddleware, getProfile);

// Route protégée : change le mot de passe de l'utilisateur connecté.
router.put('/password', authMiddleware, changePassword);

export default router;