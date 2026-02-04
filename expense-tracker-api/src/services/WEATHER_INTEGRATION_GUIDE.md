# Weather Tool Integration Guide

This guide shows you how to integrate the weather tools with your existing AI agent in the expense tracker application.

## Quick Start

### Step 1: Add API Key to Environment

Add to your `.env` file:
```env
OPENWEATHER_API_KEY=your_api_key_here
```

Get your free API key from: https://openweathermap.org/api

### Step 2: Import the Weather Tools

In `src/services/chatService.ts`, add the import:

```typescript
import { 
  createGetCurrentWeatherTool, 
  createGetWeatherForecastTool 
} from './weatherTool';
```

### Step 3: Add Tools to the Agent

In the `sendMessage` method of `ChatService`, add the weather tools to the tools array:

```typescript
// Create tools for this user
const tools = [
  createGetCategoriesTool(userId),
  createExpenseTool(userId),
  createGetRecentExpensesTool(userId),
  createIncomeTool(userId),
  createGetExpenseSummaryTool(userId),
  createUpdateExpenseTool(userId),
  createDeleteExpenseTool(userId),
  createSearchExpensesTool(userId),
  // Add weather tools
  createGetCurrentWeatherTool(),
  createGetWeatherForecastTool(),
];
```

That's it! Your AI agent can now answer weather-related questions.

## Complete Integration Example

Here's the complete modified section of `chatService.ts`:

```typescript
async sendMessage(
  userId: string,
  conversationId: string,
  message: string
): Promise<string> {
  // Load conversation history
  const chatHistory = await this.loadConversationHistory(userId, conversationId);

  // Save user message
  await this.saveMessage(userId, conversationId, 'user', message);

  // Create tools for this user
  const tools = [
    // Expense management tools
    createGetCategoriesTool(userId),
    createExpenseTool(userId),
    createGetRecentExpensesTool(userId),
    createIncomeTool(userId),
    createGetExpenseSummaryTool(userId),
    createUpdateExpenseTool(userId),
    createDeleteExpenseTool(userId),
    createSearchExpensesTool(userId),
    
    // Weather tools (no userId needed - they're global)
    createGetCurrentWeatherTool(),
    createGetWeatherForecastTool(),
  ];

  // Rest of the method remains the same...
  const systemMessage = new SystemMessage(
    `You are a helpful financial assistant that helps users track their expenses and income. 
    You can also provide weather information when asked.
    
    When users ask about weather:
    - Use get_current_weather for current conditions
    - Use get_weather_forecast for future weather (up to 5 days)
    - Always specify the location clearly
    
    When users ask about expenses:
    - Use the expense tools to help them track and analyze their spending
    - Be conversational and helpful
    - Format currency amounts clearly
    
    Always be friendly, concise, and accurate.`
  );
  
  // ... rest of the implementation
}
```

## Example Conversations

Once integrated, your AI agent can handle conversations like:

### Example 1: Weather Query
```
User: What's the weather in Tokyo?

AI: [Calls get_current_weather]
The current weather in Tokyo, Japan is 15°C with clear skies. 
It feels like 14°C with 60% humidity and light winds at 3.2 m/s.
```

### Example 2: Planning with Weather
```
User: I'm planning a trip to Paris next week. What's the weather forecast?

AI: [Calls get_weather_forecast]
Here's the 5-day forecast for Paris, France:
- Jan 29: 8-12°C, partly cloudy
- Jan 30: 7-11°C, light rain
- Jan 31: 9-13°C, cloudy
- Feb 1: 10-14°C, clear sky
- Feb 2: 8-12°C, partly cloudy

You might want to pack an umbrella for Jan 30th when light rain is expected!
```

### Example 3: Combined Expense and Weather
```
User: I spent $50 on groceries today. Also, will it rain tomorrow in London?

AI: [Calls create_expense and get_weather_forecast]
I've recorded your $50 grocery expense for today.

As for London's weather tomorrow, there's a 60% chance of light rain 
with temperatures between 8-12°C. You should probably bring an umbrella!
```

## Testing the Integration

### Method 1: Using the Test File

Run the standalone test:
```bash
cd expense-tracker-api
npx ts-node src/services/weatherTool.test.ts
```

### Method 2: Through the Chat API

After integration, test via the chat endpoint:

```bash
curl -X POST http://localhost:5000/api/chat/message \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "message": "What is the weather in London?",
    "conversationId": "test-conversation"
  }'
```

### Method 3: Through the Web Interface

If you have the web interface running:
1. Open the chat interface
2. Type: "What's the weather in New York?"
3. The AI should respond with current weather information

## Customization Options

### Change Default Units

Modify the schema defaults in `weatherTool.ts`:

```typescript
// For Fahrenheit by default
export const getCurrentWeatherSchema = z.object({
  location: z.string().describe('City name or "city,country"'),
  units: z.enum(['metric', 'imperial']).optional().default('imperial'),
});
```

### Add More Weather Data

The OpenWeatherMap API provides additional data. You can extend the tool to include:
- UV Index
- Air Quality
- Sunrise/Sunset times
- Moon phase

Example:
```typescript
const weatherData: WeatherData = {
  // ... existing fields
  sunrise: new Date(data.sys.sunrise * 1000).toLocaleTimeString(),
  sunset: new Date(data.sys.sunset * 1000).toLocaleTimeString(),
  uvIndex: data.uvi, // Requires different API endpoint
};
```

### Improve System Message

Update the system message to give the AI better context:

```typescript
const systemMessage = new SystemMessage(
  `You are a helpful assistant for expense tracking and general information.
  
  For weather queries:
  - Always use the city,country format when possible (e.g., "Paris,FR")
  - Provide temperature in the user's preferred units
  - Mention if conditions are unusual or extreme
  - Suggest appropriate clothing or preparations
  
  For expense queries:
  - Help users track and analyze their spending
  - Provide insights and summaries when asked
  - Be proactive about suggesting budget tips
  
  Be conversational, helpful, and accurate.`
);
```

## Troubleshooting

### Weather tool not being called

**Problem**: AI responds with "I don't know the weather" instead of calling the tool.

**Solution**: 
- Check that tools are properly added to the array
- Verify the system message mentions weather capabilities
- Ensure the AI model supports function calling (GPT-4, Gemini 1.5)

### API key errors

**Problem**: "Weather API key is not configured"

**Solution**:
- Verify OPENWEATHER_API_KEY is in .env file
- Restart the server after adding the key
- Check for typos in the environment variable name

### Location not found

**Problem**: "Location 'XYZ' not found"

**Solution**:
- Use "City,CountryCode" format (e.g., "London,UK")
- Check spelling of city names
- Use English city names
- Try major cities first to verify the tool works

## Performance Considerations

### Caching

For production use, consider caching weather data:

```typescript
// Simple in-memory cache
const weatherCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

// In the tool function:
const cacheKey = `${location}-${units}`;
const cached = weatherCache.get(cacheKey);

if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
  return JSON.stringify(cached.data);
}

// ... fetch from API ...

weatherCache.set(cacheKey, { data: result, timestamp: Date.now() });
```

### Rate Limiting

Free tier limits: 60 calls/minute, 1000 calls/day

Consider implementing rate limiting or upgrading to a paid plan for production use.

## Next Steps

1. ✅ Add OPENWEATHER_API_KEY to .env
2. ✅ Import weather tools in chatService.ts
3. ✅ Add tools to the tools array
4. ✅ Update system message
5. ✅ Test with sample queries
6. ✅ Deploy and monitor usage

## Support

For issues with:
- **The weather tool**: Check this guide and the README
- **OpenWeatherMap API**: Visit https://openweathermap.org/faq
- **LangChain integration**: Check LangChain documentation

Happy coding! 🌤️

