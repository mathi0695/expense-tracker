import { Router } from 'express';
import {
  sendMessage,
  getConversationHistory,
  clearConversation,
} from '../controllers/chatController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Send a message to the AI chatbot
router.post('/message', sendMessage);

// Get conversation history
router.get('/conversation/:conversationId', getConversationHistory);

// Clear conversation history
router.delete('/conversation/:conversationId', clearConversation);

export default router;

