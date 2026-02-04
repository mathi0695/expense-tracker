import api from './api';

export interface ChatMessage {
  _id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
}

export interface SendMessageRequest {
  message: string;
  conversationId?: string;
}

export interface SendMessageResponse {
  success: boolean;
  data: {
    conversationId: string;
    message: string;
    timestamp: string;
  };
}

export interface ConversationHistoryResponse {
  success: boolean;
  data: {
    conversationId: string;
    messages: ChatMessage[];
  };
}

export const chatService = {
  /**
   * Send a message to the AI chatbot
   */
  async sendMessage(data: SendMessageRequest): Promise<SendMessageResponse> {
    const response = await api.post<SendMessageResponse>('/chat/message', data);
    return response.data;
  },

  /**
   * Get conversation history
   */
  async getConversationHistory(conversationId: string): Promise<ConversationHistoryResponse> {
    const response = await api.get<ConversationHistoryResponse>(
      `/chat/conversation/${conversationId}`
    );
    return response.data;
  },

  /**
   * Clear conversation history
   */
  async clearConversation(conversationId: string): Promise<void> {
    await api.delete(`/chat/conversation/${conversationId}`);
  },
};

