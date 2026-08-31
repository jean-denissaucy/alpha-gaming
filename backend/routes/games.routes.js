import { Router } from 'express';
import { } from '../controllers/games.controller.js';

const router = Router();

router.get('/games/:id', getLatestQuickGames);

export default router;