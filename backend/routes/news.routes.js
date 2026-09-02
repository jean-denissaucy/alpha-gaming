import { Router } from 'express';
import { getLatestNews, getLatestEsport, getLatestQuickTests } from '../controllers/news.controller.js';

const router = Router();

router.get('/', getLatestNews);
router.get('/esport', getLatestEsport);
router.get('/tests-rapides', getLatestQuickTests);

export default router;
