import { Router } from 'express';
import { query } from '../config/db.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import adminMiddleware from '../middlewares/admin.middleware.js';
import gameController from '../controllers/game.controllers.js';
import { buildErrorResponse, buildSuccessResponse } from '../utils/response.js';

const router = Router();
router.use(authMiddleware, adminMiddleware);

router.get('/stats', async (req, res) => {
    try {
        const [users, games, news, esport] = await Promise.all([
            query('SELECT COUNT(*) AS total FROM users'),
            query('SELECT COUNT(*) AS total FROM games'),
            query('SELECT COUNT(*) AS total FROM news'),
            query('SELECT COUNT(*) AS total FROM live_esport')
        ]);
        return res.json(buildSuccessResponse({
            users: Number(users[0]?.total || 0),
            games: Number(games[0]?.total || 0),
            news: Number(news[0]?.total || 0),
            esport: Number(esport[0]?.total || 0)
        }));
    } catch (error) {
        console.error('Erreur statistiques admin:', error.code || 'UNKNOWN', error.message);
        return res.status(503).json(buildErrorResponse('Données administrateur indisponibles', 503));
    }
});

router.get('/games', gameController.getAllGames);
router.post('/games', gameController.createGame);
router.put('/games/:id', gameController.updateGame);
router.delete('/games/:id', gameController.deleteGame);

export default router;
