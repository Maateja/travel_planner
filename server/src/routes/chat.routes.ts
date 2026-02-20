import { Router } from 'express';
import { chatAssistant, getChatHistory, listAvailableModels } from '../controllers/chat.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.post('/', authenticateToken, chatAssistant);
router.get('/history', authenticateToken, getChatHistory);
router.get('/models', listAvailableModels);

export default router;
