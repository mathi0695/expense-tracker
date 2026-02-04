import { useState, useEffect, useRef } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  TextField,
  Paper,
  CircularProgress,
  Alert,
  Divider,
  Tooltip,
} from '@mui/material';
import {
  Close as CloseIcon,
  Send as SendIcon,
  Delete as DeleteIcon,
  SmartToy as BotIcon,
  Person as PersonIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { chatService, type ChatMessage } from '../services/chatService';

interface ChatDrawerProps {
  open: boolean;
  onClose: () => void;
}

const ChatDrawer = ({ open, onClose }: ChatDrawerProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Helper to detect if message is an action confirmation
  const isActionConfirmation = (content: string): boolean => {
    const actionKeywords = [
      'successfully created',
      'successfully recorded',
      'successfully updated',
      'successfully deleted',
      'recorded',
      'added expense',
      'expense created',
      'income recorded',
      'updated expense',
      'deleted expense',
      '✅',
      'done!',
    ];
    return actionKeywords.some(keyword =>
      content.toLowerCase().includes(keyword.toLowerCase())
    );
  };

  // Helper to detect if message contains an image URL
  const isImageUrl = (content: string): boolean => {
    // Check if content is a URL pointing to an image
    const imageUrlPattern = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|bmp)$/i;
    const dalleUrlPattern = /^https?:\/\/.*openai\.com.*$/i;
    const azureBlobPattern = /^https?:\/\/oaidalleapiprodscus\.blob\.core\.windows\.net\/.*$/i;
    const dataUrlPattern = /^data:image\/(png|jpeg|jpg|gif|webp|bmp);base64,/i;

    const trimmedContent = content.trim();
    return imageUrlPattern.test(trimmedContent) ||
           dalleUrlPattern.test(trimmedContent) ||
           azureBlobPattern.test(trimmedContent) ||
           dataUrlPattern.test(trimmedContent);
  };

  // Extract image URL from message content
  const extractImageUrl = (content: string): string | null => {
    const trimmedContent = content.trim();

    // Check if the entire message is a URL or data URL
    if (isImageUrl(trimmedContent)) {
      return trimmedContent;
    }

    // Try to extract data URL first (base64 images)
    const dataUrlPattern = /data:image\/(png|jpeg|jpg|gif|webp|bmp);base64,[A-Za-z0-9+/=]+/i;
    const dataUrlMatch = trimmedContent.match(dataUrlPattern);
    if (dataUrlMatch) {
      return dataUrlMatch[0];
    }

    // Try to extract regular URL from text
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    const matches = trimmedContent.match(urlPattern);

    if (matches) {
      for (const url of matches) {
        if (isImageUrl(url)) {
          return url;
        }
      }
    }

    return null;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setError('');

    // Add user message to UI immediately
    const tempUserMessage: ChatMessage = {
      _id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMessage]);

    setLoading(true);
    try {
      const response = await chatService.sendMessage({
        message: userMessage,
        conversationId: conversationId || undefined,
      });

      // Update conversation ID if it's a new conversation
      if (!conversationId) {
        setConversationId(response.data.conversationId);
      }

      // Add AI response to messages
      const aiMessage: ChatMessage = {
        _id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.data.message,
        createdAt: response.data.timestamp,
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send message');
      // Remove the temporary user message on error
      setMessages((prev) => prev.filter((msg) => msg._id !== tempUserMessage._id));
    } finally {
      setLoading(false);
    }
  };

  const handleClearConversation = async () => {
    if (!conversationId) return;

    try {
      await chatService.clearConversation(conversationId);
      setMessages([]);
      setConversationId(null);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to clear conversation');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 400 },
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'primary.main',
          color: 'white',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BotIcon />
          <Typography variant="h6" fontWeight={600}>
            AI Assistant
          </Typography>
        </Box>
        <Box>
          {conversationId && (
            <Tooltip title="Clear conversation">
              <IconButton onClick={handleClearConversation} size="small" sx={{ color: 'white' }}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          )}
          <IconButton onClick={onClose} size="small" sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ m: 2 }}>
          {error}
        </Alert>
      )}

      {/* Messages Container */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          bgcolor: '#f5f5f5',
        }}
      >
        {messages.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              gap: 2,
              color: 'text.secondary',
            }}
          >
            <BotIcon sx={{ fontSize: 64, opacity: 0.3 }} />
            <Typography variant="body1" textAlign="center">
              Hi! I'm your AI assistant.
              <br />
              Ask me anything about your expenses!
            </Typography>
          </Box>
        ) : (
          messages.map((message) => (
            <Box
              key={message._id}
              sx={{
                display: 'flex',
                gap: 1,
                alignItems: 'flex-start',
                flexDirection: message.role === 'user' ? 'row-reverse' : 'row',
              }}
            >
              {/* Avatar */}
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  bgcolor: message.role === 'user' ? 'primary.main' : 'secondary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  flexShrink: 0,
                }}
              >
                {message.role === 'user' ? (
                  <PersonIcon sx={{ fontSize: 20 }} />
                ) : (
                  <BotIcon sx={{ fontSize: 20 }} />
                )}
              </Box>

              {/* Message Bubble */}
              <Paper
                elevation={1}
                sx={{
                  p: 1.5,
                  maxWidth: message.role === 'assistant' && extractImageUrl(message.content) ? '90%' : '75%',
                  bgcolor: message.role === 'user'
                    ? 'primary.main'
                    : isActionConfirmation(message.content)
                    ? 'success.light'
                    : 'white',
                  color: message.role === 'user' ? 'white' : 'text.primary',
                  borderRadius: 2,
                  wordWrap: 'break-word',
                  border: isActionConfirmation(message.content) && message.role === 'assistant'
                    ? '2px solid'
                    : 'none',
                  borderColor: 'success.main',
                }}
              >
                {message.role === 'assistant' && isActionConfirmation(message.content) && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                    <CheckIcon sx={{ fontSize: 16, color: 'success.main' }} />
                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'success.main' }}>
                      Action Completed
                    </Typography>
                  </Box>
                )}

                {/* Display image if message contains image URL */}
                {message.role === 'assistant' && extractImageUrl(message.content) ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <img
                      src={extractImageUrl(message.content)!}
                      alt="Financial Chart"
                      style={{
                        width: '100%',
                        height: 'auto',
                        borderRadius: '8px',
                        maxHeight: '400px',
                        objectFit: 'contain',
                      }}
                      onError={(e) => {
                        // Fallback if image fails to load
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                      📊 Financial Chart Generated
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {message.content}
                  </Typography>
                )}

                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    mt: 0.5,
                    opacity: 0.7,
                    fontSize: '0.7rem',
                  }}
                >
                  {new Date(message.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Typography>
              </Paper>
            </Box>
          ))
        )}
        {loading && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                bgcolor: 'secondary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
              }}
            >
              <BotIcon sx={{ fontSize: 20 }} />
            </Box>
            <Paper elevation={1} sx={{ p: 1.5, borderRadius: 2 }}>
              <CircularProgress size={20} />
            </Paper>
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Box>

      <Divider />

      {/* Input Area */}
      <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            placeholder="Type your message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
              },
            }}
          />
          <IconButton
            color="primary"
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || loading}
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              '&:hover': {
                bgcolor: 'primary.dark',
              },
              '&.Mui-disabled': {
                bgcolor: 'action.disabledBackground',
              },
            }}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Box>
    </Drawer>
  );
};

export default ChatDrawer;

