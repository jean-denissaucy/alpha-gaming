import { Router } from 'express';
import gameController from '../controllers/game.controllers.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = Router();

// Routes publiques
router.get('/', gameController.getAllGames);
router.get('/category/:categoryId', gameController.getGamesByCategoryId);
router.get('/:id', gameController.getGameById);

// Routes protégées
// Pour créer, modifier ou supprimer un jeu, il faut être connecté.
router.post('/', authMiddleware, gameController.createGame);
router.put('/:id', authMiddleware, gameController.updateGame);
router.delete('/:id', authMiddleware, gameController.deleteGame);

export default router;