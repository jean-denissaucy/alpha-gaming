import { Router } from 'express';
import gameController from '../controllers/game.controllers.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import adminMiddleware from '../middlewares/admin.middleware.js';

const router = Router();

// Routes publiques
router.get('/', gameController.getAllGames);
router.get('/category/:categoryId', gameController.getGamesByCategoryId);
router.get('/:id', gameController.getGameById);

// Routes d'écriture réservées aux administrateurs (JWT + rôle admin ou ADMIN_EMAILS).
// Un simple compte connecté ne doit pas pouvoir créer, modifier ou supprimer des jeux du catalogue.
// Les mêmes opérations existent aussi sous /api/admin/games.
router.post('/', authMiddleware, adminMiddleware, gameController.createGame);
router.put('/:id', authMiddleware, adminMiddleware, gameController.updateGame);
router.delete('/:id', authMiddleware, adminMiddleware, gameController.deleteGame);

export default router;