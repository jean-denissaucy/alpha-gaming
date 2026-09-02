import { Router } from 'express';
import { getLatestNews, getLatestEsport, getLatestNotes, getGamekultTests } from '../controllers/news.controller.js';

const router = Router();

router.get('/', getLatestNews);
router.get('/esport', getLatestEsport);
router.get('/notes', getLatestNotes);
router.get('/tests', getGamekultTests);

export default router;
