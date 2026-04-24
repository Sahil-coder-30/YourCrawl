import { Router } from 'express';
import { ragQuery } from '../controllers/rag.controller.js';
import { identifyUser } from '../middlewares/auth.middleware.js';

const router = Router();

// All RAG routes require authentication
router.use(identifyUser);

router.post('/query', ragQuery);

export default router;
