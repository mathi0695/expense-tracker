# AI Chatbot Feature - Setup Guide

## Overview
An AI-powered chatbot has been successfully integrated into your expense tracker application. The chatbot uses LangChain to support multiple AI providers (OpenAI and Google Gemini) and maintains conversation history with memory.

## Features Implemented

### Backend (Express + TypeScript)
1. **LangChain Integration**
   - Support for OpenAI (GPT-4) and Google Gemini
   - Conversation memory with MongoDB persistence
   - Flexible model configuration via environment variables

2. **API Endpoints**
   - `POST /api/chat/message` - Send a message to the AI
   - `GET /api/chat/conversation/:conversationId` - Get conversation history
   - `DELETE /api/chat/conversation/:conversationId` - Clear conversation

3. **Database Model**
   - `ChatMessage` model stores all conversation history
   - Indexed for efficient querying by user and conversation

### Frontend (React + TypeScript + Material-UI)
1. **Floating Chat Button**
   - Fixed position button in bottom-right corner
   - Smooth hover animation
   - Badge support for notifications

2. **Chat Drawer (LinkedIn-style)**
   - Slides in from the right
   - Message bubbles with avatars
   - Real-time message display
   - Auto-scroll to latest message
   - Clear conversation option
   - Responsive design (full-width on mobile)

## Setup Instructions

### 1. Backend Configuration

Update your `.env` file in `expense-tracker-api/`:

```env
# Choose your AI provider: 'openai' or 'gemini'
AI_PROVIDER=openai

# OpenAI Configuration
OPENAI_API_KEY=your-actual-openai-api-key-here

# Google Gemini Configuration (if using Gemini)
GEMINI_API_KEY=your-actual-gemini-api-key-here

# Optional: Specify model (defaults to gpt-4 for OpenAI, gemini-1.5-flash for Gemini)
AI_MODEL=gpt-4
```

### 2. Get API Keys

#### For OpenAI:
1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Copy and paste it into your `.env` file

#### For Google Gemini:
1. Go to https://makersuite.google.com/app/apikey
2. Create a new API key
3. Copy and paste it into your `.env` file

### 3. Start the Application

#### Backend:
```bash
cd expense-tracker-api
npm run dev
```

#### Frontend:
```bash
cd expense-tracker-web
npm run dev
```

## Usage

1. **Open the Chat**: Click the floating chat button in the bottom-right corner
2. **Start Chatting**: Type your message and press Enter or click the send button
3. **View History**: All messages are saved and will persist across sessions
4. **Clear Chat**: Click the trash icon in the chat header to clear the conversation
5. **Close Chat**: Click the X button or click outside the drawer

## Technical Details

### Conversation Memory
- Each conversation has a unique ID
- Messages are stored in MongoDB with user association
- Last 50 messages are loaded for context
- Conversations persist across sessions

### AI Model Configuration
You can switch between providers by changing the `AI_PROVIDER` environment variable:
- `openai` - Uses OpenAI's GPT models
- `gemini` - Uses Google's Gemini models

#### Available Models:

**OpenAI Models:**
- `gpt-4` (default) - Most capable, higher cost
- `gpt-4-turbo` - Faster, more cost-effective
- `gpt-3.5-turbo` - Fast and economical

**Google Gemini Models:**
- `gemini-1.5-flash` (default) - Fast and efficient
- `gemini-1.5-flash-8b` - Smaller, faster variant
- `gemini-1.5-pro` - More capable (requires different API version)

**Note:** If you get a 404 error with Gemini, make sure you're using `gemini-1.5-flash` or `gemini-1.5-flash-8b`.

### Customization Options

#### Change AI Model:
Edit `.env`:
```env
AI_MODEL=gpt-3.5-turbo  # For OpenAI
# or
AI_MODEL=gemini-1.5-flash  # For Gemini (also available: gemini-1.5-flash-8b)
```

#### Adjust Message History Limit:
Edit `expense-tracker-api/src/services/chatService.ts`:
```typescript
.limit(50); // Change this number
```

#### Customize Chat Appearance:
Edit `expense-tracker-web/src/components/ChatDrawer.tsx` to modify colors, sizes, and styles.

## Files Created/Modified

### Backend:
- ✅ `src/models/ChatMessage.ts` - MongoDB schema for chat messages
- ✅ `src/services/chatService.ts` - LangChain service with AI integration
- ✅ `src/controllers/chatController.ts` - API controllers
- ✅ `src/routes/chatRoutes.ts` - API routes
- ✅ `src/app.ts` - Added chat routes
- ✅ `.env.example` - Updated with AI configuration

### Frontend:
- ✅ `src/services/chatService.ts` - API service for chat
- ✅ `src/components/ChatDrawer.tsx` - Main chat UI component
- ✅ `src/components/FloatingChatButton.tsx` - Floating button component
- ✅ `src/components/Layout.tsx` - Integrated chat components

## Dependencies Installed

### Backend:
- `langchain` - LangChain framework
- `@langchain/openai` - OpenAI integration
- `@langchain/google-genai` - Google Gemini integration
- `@langchain/community` - Community integrations
- `@langchain/core` - Core LangChain types
- `uuid` - For generating conversation IDs

### Frontend:
No additional dependencies needed (uses existing Material-UI components)

## Troubleshooting

### Chat not responding:
1. Check that your API key is correctly set in `.env`
2. Verify the backend server is running
3. Check browser console for errors
4. Ensure MongoDB is running

### "API key not configured" error:
- Make sure you've set either `OPENAI_API_KEY` or `GEMINI_API_KEY` in your `.env` file
- Restart the backend server after updating `.env`

### Messages not persisting:
- Verify MongoDB connection is working
- Check that the `ChatMessage` model is properly created

## Next Steps

You can enhance the chatbot by:
1. Adding system prompts to customize AI behavior
2. Implementing typing indicators
3. Adding file/image upload support
4. Creating conversation management (list, rename, delete)
5. Adding AI-powered expense insights and recommendations
6. Implementing voice input/output

Enjoy your new AI chatbot! 🤖💬

