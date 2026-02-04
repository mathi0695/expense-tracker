import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { createChatService } from '../services/chatService';
import { v4 as uuidv4 } from 'uuid';

/**
 * Send a message to the AI chatbot
 */
export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { message, conversationId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      res.status(400).json({
        success: false,
        message: 'Message is required',
      });
      return;
    }

    // Use provided conversationId or create a new one
    const convId = conversationId || uuidv4();

    // Create chat service
    const chatService = createChatService();

    // Send message and get response
    const response = await chatService.sendMessage(userId, convId, message.trim());

    res.status(200).json({
      success: true,
      data: {
        conversationId: convId,
        message: response,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Error in sendMessage:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send message',
    });
  }
};

/**
 * Get conversation history
 */
export const getConversationHistory = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const conversationId = Array.isArray(req.params.conversationId)
      ? req.params.conversationId[0]
      : req.params.conversationId;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }

    if (!conversationId) {
      res.status(400).json({
        success: false,
        message: 'Conversation ID is required',
      });
      return;
    }

    const chatService = createChatService();
    const history = await chatService.getConversationHistory(userId, conversationId);

    res.status(200).json({
      success: true,
      data: {
        conversationId,
        messages: history,
      },
    });
  } catch (error: any) {
    console.error('Error in getConversationHistory:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get conversation history',
    });
  }
};

/**
 * Clear conversation history
 */
export const clearConversation = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const conversationId = Array.isArray(req.params.conversationId)
      ? req.params.conversationId[0]
      : req.params.conversationId;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }

    if (!conversationId) {
      res.status(400).json({
        success: false,
        message: 'Conversation ID is required',
      });
      return;
    }

    const chatService = createChatService();
    await chatService.clearConversation(userId, conversationId);

    res.status(200).json({
      success: true,
      message: 'Conversation cleared successfully',
    });
  } catch (error: any) {
    console.error('Error in clearConversation:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to clear conversation',
    });
  }
};

