// middlewares/auth.middleware.js
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js'; // .js ! ⬅️
import { buildErrorResponse } from '../utils/response.js';
const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json(buildErrorResponse('Token manquant', 401));
        }
        const token = authHeader.split(' ')[1];
        const jwtSecret = process.env.JWT_SECRET || process.env.JTW_secret;
        if (!jwtSecret) {
            return res.status(500).json(buildErrorResponse('JWT_SECRET manquant côté serveur', 500));
        }
        const decoded = jwt.verify(token, jwtSecret);
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json(buildErrorResponse('Utilisateur non trouvé', 401));
        }
        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json(buildErrorResponse('Token expiré', 401));
        }
        return res.status(401).json(buildErrorResponse('Token invalide', 401));
    }
};
export default authMiddleware;