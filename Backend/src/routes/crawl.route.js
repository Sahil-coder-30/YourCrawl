import { Router } from 'express';
import { crawlUrl } from '../controllers/crawl.controller.js';

const router = Router();

// Define the crawl route endpoint
router.post('/crawl', crawlUrl);

export default router;
