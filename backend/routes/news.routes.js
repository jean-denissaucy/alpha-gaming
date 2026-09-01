import { Router } from 'express';
import { getLatestNews, getLatestEsport, getLatestNotes } from '../controllers/news.controller.js';

const router = Router();

router.get('/', getLatestNews);
router.get('/esport', getLatestEsport);
router.get('/notes', getLatestNotes);

export default router;
