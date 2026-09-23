import { Router } from 'express';
import { query } from '../config/db.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import adminMiddleware from '../middlewares/admin.middleware.js';
import gameController from '../controllers/game.controllers.js';
import User from '../models/user.model.js';
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
    } catch (error) {    console.error('Erreur statistiques admin:', error.code || 'UNKNOWN', error.message);
    return res.status(503).json(buildErrorResponse('Données administrateur indisponibles', 503));
    }
});

router.get('/users', async (req, res) => {
    try { return res.json(buildSuccessResponse({ users: await User.findAllForAdmin() })); }
    catch (error) { console.error('Erreur utilisateurs admin:', error.code || 'UNKNOWN', error.message); return res.status(503).json(buildErrorResponse('Utilisateurs indisponibles', 503)); }
});

router.put('/users/:id', async (req, res) => {
    try {
        const { email, firstname, lastname, role } = req.body || {};
        if (!email || !firstname || !lastname) return res.status(400).json(buildErrorResponse('Les champs utilisateur sont requis', 400));
        if (Number(req.params.id) === Number(req.user.id) && role !== 'admin') return res.status(400).json(buildErrorResponse('Vous ne pouvez pas retirer votre propre rôle admin', 400));
        const updated = await User.updateById(req.params.id, { email, firstname, lastname, role });
        return updated ? res.json(buildSuccessResponse({ message: 'Utilisateur mis à jour' })) : res.status(404).json(buildErrorResponse('Utilisateur introuvable', 404));
    } catch (error) { console.error('Erreur modification utilisateur:', error.code || 'UNKNOWN', error.message); return res.status(503).json(buildErrorResponse('Utilisateur non modifiable', 503)); }
});

router.delete('/users/:id', async (req, res) => {
    try {
        if (Number(req.params.id) === Number(req.user.id)) return res.status(400).json(buildErrorResponse('Vous ne pouvez pas supprimer votre propre compte', 400));
        const deleted = await User.deleteById(req.params.id);
        return deleted ? res.json(buildSuccessResponse({ message: 'Utilisateur supprimé' })) : res.status(404).json(buildErrorResponse('Utilisateur introuvable', 404));
    } catch (error) { console.error('Erreur suppression utilisateur:', error.code || 'UNKNOWN', error.message); return res.status(503).json(buildErrorResponse('Utilisateur non supprimable', 503)); }
});

router.get('/games', gameController.getAllGames);
router.post('/games', gameController.createGame);
router.put('/games/:id', gameController.updateGame);
router.delete('/games/:id', gameController.deleteGame);

export default router;
