import { Router } from 'express';
import { chatAssistant } from '../controllers/chat.controller.js';
import { authenticateToken } from '../middleware/auth.js';
const router = Router();
router.post('/', authenticateToken, chatAssistant);
export default router;
