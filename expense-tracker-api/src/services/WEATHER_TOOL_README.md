# Weather Forecast Tool for AI Agent

A standalone weather tool that can be integrated with AI agents to provide current weather conditions and forecasts for any location worldwide.

## Features

- **Current Weather**: Get real-time weather conditions including temperature, humidity, wind speed, and more
- **Weather Forecast**: Get 1-5 day weather forecasts with daily temperature ranges and conditions
- **Flexible Units**: Support for both metric (Celsius) and imperial (Fahrenheit) units
- **Error Handling**: Comprehensive error handling with helpful error messages
- **Type Safety**: Full TypeScript support with Zod schema validation

## Setup

### 1. Get an API Key

1. Visit [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up for a free account
3. Navigate to API Keys section
4. Copy your API key

### 2. Configure Environment Variables

Add the following to your `.env` file:

```env
OPENWEATHER_API_KEY=your_api_key_here
```

### 3. Install Dependencies

The tool uses the following dependencies (already included in the project):
- `@langchain/core` - For tool structure
- `zod` - For schema validation
- `axios` - For HTTP requests

## Usage

### Importing the Tools

```typescript
import { 
  createGetCurrentWeatherTool, 
  createGetWeatherForecastTool 
} from './services/weatherTool';
```

### Using with AI Agent

Add the weather tools to your AI agent's tool list:

```typescript
const tools = [
  createGetCurrentWeatherTool(),
  createGetWeatherForecastTool(),
  // ... other tools
];

const modelWithTools = model.bindTools(tools);
```

### Example Integration

Here's how to integrate with the existing chat service:

```typescript
// In chatService.ts
import { createGetCurrentWeatherTool, createGetWeatherForecastTool } from './weatherTool';

// Inside sendMessage method, add to tools array:
const tools = [
  createGetCategoriesTool(userId),
  createExpenseTool(userId),
  // ... other expense tools
  createGetCurrentWeatherTool(),
  createGetWeatherForecastTool(),
];
```

## Tool Specifications

### 1. Get Current Weather

**Tool Name**: `get_current_weather`

**Description**: Get the current weather conditions for a specific location.

**Parameters**:
- `location` (string, required): City name or "city,country" format (e.g., "London" or "London,UK")
- `units` (string, optional): Temperature units - "metric" (Celsius) or "imperial" (Fahrenheit). Default: "metric"

**Example Usage**:
```typescript
const tool = createGetCurrentWeatherTool();
const result = await tool.func({
  location: "New York,US",
  units: "imperial"
});
```

**Response Format**:
```json
{
  "success": true,
  "data": {
    "location": "New York",
    "country": "US",
    "temperature": 72,
    "feelsLike": 70,
    "humidity": 65,
    "description": "partly cloudy",
    "windSpeed": 5.2,
    "pressure": 1013,
    "visibility": 10,
    "cloudiness": 40
  },
  "message": "Current weather in New York, US: 72°F, partly cloudy. Feels like 70°F. Humidity: 65%, Wind: 5.2 mph."
}
```

### 2. Get Weather Forecast

**Tool Name**: `get_weather_forecast`

**Description**: Get weather forecast for the next 1-5 days for a specific location.

**Parameters**:
- `location` (string, required): City name or "city,country" format
- `days` (number, optional): Number of days to forecast (1-5). Default: 3
- `units` (string, optional): Temperature units - "metric" or "imperial". Default: "metric"

**Example Usage**:
```typescript
const tool = createGetWeatherForecastTool();
const result = await tool.func({
  location: "Tokyo,JP",
  days: 5,
  units: "metric"
});
```

**Response Format**:
```json
{
  "success": true,
  "location": "Tokyo",
  "country": "JP",
  "forecasts": [
    {
      "date": "2026-01-28",
      "temperature": {
        "min": 8,
        "max": 15,
        "avg": 12
      },
      "description": "clear sky",
      "humidity": 55,
      "windSpeed": 3.5,
      "precipitation": 10
    }
  ],
  "message": "3-day forecast for Tokyo, JP: 2026-01-28: 8-15°C, clear sky; ..."
}
```

## Example AI Agent Conversations

### Example 1: Current Weather
```
User: What's the weather like in Paris?
AI: [Calls get_current_weather with location="Paris,FR"]
AI: The current weather in Paris, France is 12°C with light rain. 
    It feels like 10°C with 78% humidity and wind at 4.5 m/s.
```

### Example 2: Weather Forecast
```
User: Will it rain in London this week?
AI: [Calls get_weather_forecast with location="London,UK", days=5]
AI: Here's the 5-day forecast for London:
    - Jan 28: 8-12°C, cloudy (20% chance of rain)
    - Jan 29: 7-11°C, light rain (60% chance of rain)
    - Jan 30: 9-13°C, partly cloudy (30% chance of rain)
    ...
```

## Error Handling

The tool handles various error scenarios:

1. **Missing API Key**: Returns error message asking to configure OPENWEATHER_API_KEY
2. **Location Not Found**: Returns helpful message suggesting to check spelling or format
3. **API Errors**: Returns the API error message or a generic failure message

## Testing

You can test the tool standalone:

```typescript
import { createGetCurrentWeatherTool } from './services/weatherTool';

async function testWeather() {
  const tool = createGetCurrentWeatherTool();
  const result = await tool.func({ location: "London,UK", units: "metric" });
  console.log(JSON.parse(result));
}

testWeather();
```

## API Limits

The free tier of OpenWeatherMap API includes:
- 1,000 API calls per day
- 60 calls per minute
- Current weather and 5-day forecast access

For higher limits, consider upgrading to a paid plan.

## Troubleshooting

### "API key not configured" error
- Ensure OPENWEATHER_API_KEY is set in your .env file
- Restart your application after adding the environment variable

### "Location not found" error
- Try using "City,CountryCode" format (e.g., "Paris,FR")
- Check spelling of the city name
- Use English city names

### Rate limit errors
- Free tier allows 60 calls/minute
- Implement caching if making frequent requests
- Consider upgrading your API plan

## License

This tool is part of the expense-tracker project and follows the same license.

