import { Router } from 'express';
import { getLatestNews, getLatestEsport } from '../controllers/news.controller.js';

const router = Router();

router.get('/', getLatestNews);
router.get('/esport', getLatestEsport);

export default router;
