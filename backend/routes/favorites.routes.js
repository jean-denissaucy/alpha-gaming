import { Router } from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import User from '../models/user.model.js';
import { buildErrorResponse, buildSuccessResponse } from '../utils/response.js';

const router = Router();
router.use(authMiddleware);

router.post('/:gameId', async (req, res) => {
    try {
        const gameId = Number(req.params.gameId);
        if (!Number.isInteger(gameId) || gameId < 1) {
            return res.status(400).json(buildErrorResponse('Identifiant de jeu invalide', 400));
        }
        await User.addFavoriteGame(req.user.id, gameId);
        return res.status(201).json(buildSuccessResponse({ gameId, favorite: true }));
    } catch (error) {
        console.error('Erreur ajout favori:', error);
        return res.status(500).json(buildErrorResponse('Impossible d’ajouter ce jeu aux favoris', 500));
    }
});

router.delete('/:gameId', async (req, res) => {
    try {
        const gameId = Number(req.params.gameId);
        if (!Number.isInteger(gameId) || gameId < 1) {
            return res.status(400).json(buildErrorResponse('Identifiant de jeu invalide', 400));
        }
        await User.removeFavoriteGame(req.user.id, gameId);
        return res.json(buildSuccessResponse({ gameId, favorite: false }));
    } catch (error) {
        console.error('Erreur suppression favori:', error);
        return res.status(500).json(buildErrorResponse('Impossible de retirer ce jeu des favoris', 500));
    }
});

export default router;
