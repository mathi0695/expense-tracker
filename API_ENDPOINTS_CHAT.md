# Chat API Endpoints Reference

## Base URL
```
http://localhost:3001/api/chat
```

## Authentication
All endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## 1. Send Message

Send a message to the AI chatbot and get a response.

**Endpoint:** `POST /api/chat/message`

**Request Body:**
```json
{
  "message": "What are my top expenses this month?",
  "conversationId": "optional-conversation-id"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "conversationId": "550e8400-e29b-41d4-a716-446655440000",
    "message": "Based on your expenses, your top spending categories this month are...",
    "timestamp": "2026-01-21T14:30:00.000Z"
  }
}
```

**Notes:**
- If `conversationId` is not provided, a new conversation will be created
- The same `conversationId` should be used for follow-up messages to maintain context

---

## 2. Get Conversation History

Retrieve the message history for a specific conversation.

**Endpoint:** `GET /api/chat/conversation/:conversationId`

**URL Parameters:**
- `conversationId` (required) - The unique identifier for the conversation

**Example:**
```
GET /api/chat/conversation/550e8400-e29b-41d4-a716-446655440000
```

**Response:**
```json
{
  "success": true,
  "data": {
    "conversationId": "550e8400-e29b-41d4-a716-446655440000",
    "messages": [
      {
        "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
        "role": "user",
        "content": "What are my top expenses?",
        "createdAt": "2026-01-21T14:25:00.000Z"
      },
      {
        "_id": "65a1b2c3d4e5f6g7h8i9j0k2",
        "role": "assistant",
        "content": "Your top expenses are...",
        "createdAt": "2026-01-21T14:25:05.000Z"
      }
    ]
  }
}
```

---

## 3. Clear Conversation

Delete all messages in a conversation.

**Endpoint:** `DELETE /api/chat/conversation/:conversationId`

**URL Parameters:**
- `conversationId` (required) - The unique identifier for the conversation

**Example:**
```
DELETE /api/chat/conversation/550e8400-e29b-41d4-a716-446655440000
```

**Response:**
```json
{
  "success": true,
  "message": "Conversation cleared successfully"
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 401 Unauthorized
```json
{
  "success": false,
  "message": "User not authenticated"
}
```

### 400 Bad Request
```json
{
  "success": false,
  "message": "Message is required"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Failed to send message"
}
```

---

## Example Usage with cURL

### Send a message:
```bash
curl -X POST http://localhost:3001/api/chat/message \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "message": "Hello, can you help me track my expenses?"
  }'
```

### Get conversation history:
```bash
curl -X GET http://localhost:3001/api/chat/conversation/YOUR_CONVERSATION_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Clear conversation:
```bash
curl -X DELETE http://localhost:3001/api/chat/conversation/YOUR_CONVERSATION_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Example Usage with JavaScript/Axios

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
});

// Send a message
const sendMessage = async (message, conversationId) => {
  const response = await api.post('/chat/message', {
    message,
    conversationId
  });
  return response.data;
};

// Get conversation history
const getHistory = async (conversationId) => {
  const response = await api.get(`/chat/conversation/${conversationId}`);
  return response.data;
};

// Clear conversation
const clearChat = async (conversationId) => {
  const response = await api.delete(`/chat/conversation/${conversationId}`);
  return response.data;
};
```

