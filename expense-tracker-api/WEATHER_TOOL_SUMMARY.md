# Weather Forecast Tool - Complete Package

A production-ready, standalone weather tool for AI agents built with LangChain, TypeScript, and OpenWeatherMap API.

## 📦 What's Included

This package contains everything you need to add weather capabilities to your AI agent:

### Core Files

1. **`src/services/weatherTool.ts`** - Main tool implementation
   - `createGetCurrentWeatherTool()` - Get current weather conditions
   - `createGetWeatherForecastTool()` - Get 1-5 day weather forecasts
   - Full TypeScript types and Zod schemas
   - Comprehensive error handling

2. **`src/services/WEATHER_TOOL_README.md`** - Complete documentation
   - Feature overview
   - Setup instructions
   - API reference
   - Usage examples
   - Troubleshooting guide

3. **`src/services/WEATHER_INTEGRATION_GUIDE.md`** - Integration guide
   - Step-by-step integration with existing AI agent
   - Code examples
   - Testing methods
   - Customization options

4. **`src/services/weatherTool.test.ts`** - Test suite
   - Unit tests for both tools
   - AI agent simulation
   - Error handling tests
   - Run with: `npx ts-node src/services/weatherTool.test.ts`

5. **`src/services/weatherToolStandalone.example.ts`** - Standalone examples
   - 6 practical examples
   - No AI agent required
   - Real-world use cases
   - Run with: `npx ts-node src/services/weatherToolStandalone.example.ts`

## 🚀 Quick Start

### 1. Get API Key
```bash
# Visit https://openweathermap.org/api
# Sign up for free account
# Copy your API key
```

### 2. Configure Environment
```bash
# Add to .env file
echo "OPENWEATHER_API_KEY=your_api_key_here" >> .env
```

### 3. Test the Tool
```bash
cd expense-tracker-api
npx ts-node src/services/weatherTool.test.ts
```

### 4. Use Standalone (Optional)
```typescript
import { createGetCurrentWeatherTool } from './services/weatherTool';

const tool = createGetCurrentWeatherTool();
const result = await tool.func({ location: 'London,UK', units: 'metric' });
console.log(JSON.parse(result));
```

### 5. Integrate with AI Agent (Optional)
```typescript
// In chatService.ts
import { createGetCurrentWeatherTool, createGetWeatherForecastTool } from './weatherTool';

const tools = [
  // ... existing tools
  createGetCurrentWeatherTool(),
  createGetWeatherForecastTool(),
];
```

## 🎯 Features

### Current Weather Tool
- ✅ Real-time weather data
- ✅ Temperature (actual & feels like)
- ✅ Humidity, wind speed, pressure
- ✅ Weather description
- ✅ Visibility and cloud cover
- ✅ Metric/Imperial units

### Weather Forecast Tool
- ✅ 1-5 day forecasts
- ✅ Daily temperature ranges (min/max/avg)
- ✅ Weather conditions
- ✅ Precipitation probability
- ✅ Wind and humidity forecasts
- ✅ Metric/Imperial units

### Additional Features
- ✅ Full TypeScript support
- ✅ Zod schema validation
- ✅ Comprehensive error handling
- ✅ Location format flexibility
- ✅ LangChain compatible
- ✅ Standalone usage support

## 📖 Usage Examples

### Example 1: Current Weather
```typescript
const tool = createGetCurrentWeatherTool();
const result = await tool.func({
  location: 'Tokyo,JP',
  units: 'metric'
});

// Response:
// {
//   success: true,
//   data: {
//     location: "Tokyo",
//     temperature: 15,
//     description: "clear sky",
//     ...
//   },
//   message: "Current weather in Tokyo, JP: 15°C, clear sky..."
// }
```

### Example 2: Weather Forecast
```typescript
const tool = createGetWeatherForecastTool();
const result = await tool.func({
  location: 'Paris,FR',
  days: 5,
  units: 'metric'
});

// Response:
// {
//   success: true,
//   forecasts: [
//     { date: "2026-01-28", temperature: { min: 8, max: 15 }, ... },
//     ...
//   ],
//   message: "5-day forecast for Paris, FR: ..."
// }
```

### Example 3: With AI Agent
```
User: What's the weather in New York?

AI: [Calls get_current_weather]
The current weather in New York is 72°F with partly cloudy skies. 
It feels like 70°F with 65% humidity and light winds at 5.2 mph.
```

## 🧪 Testing

### Run Test Suite
```bash
npx ts-node src/services/weatherTool.test.ts
```

### Run Standalone Examples
```bash
npx ts-node src/services/weatherToolStandalone.example.ts
```

### Test with AI Agent
```bash
curl -X POST http://localhost:5000/api/chat/message \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"message": "What is the weather in London?"}'
```

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| `WEATHER_TOOL_README.md` | Complete API reference and documentation |
| `WEATHER_INTEGRATION_GUIDE.md` | Step-by-step integration guide |
| `weatherTool.test.ts` | Test suite with examples |
| `weatherToolStandalone.example.ts` | Standalone usage examples |

## 🔧 Configuration

### Environment Variables
```env
OPENWEATHER_API_KEY=your_api_key_here  # Required
```

### Default Settings
- Units: `metric` (Celsius, m/s)
- Forecast days: `3`
- Can be changed per request

## 🌍 Supported Locations

Use any of these formats:
- City name: `"London"`
- City, Country: `"London,UK"`
- City, State, Country: `"Austin,TX,US"`

## ⚡ API Limits

Free tier includes:
- 1,000 calls/day
- 60 calls/minute
- Current weather + 5-day forecast

## 🛠️ Tech Stack

- **TypeScript** - Type safety
- **LangChain** - AI tool framework
- **Zod** - Schema validation
- **Axios** - HTTP requests
- **OpenWeatherMap API** - Weather data

## 📝 File Structure

```
expense-tracker-api/src/services/
├── weatherTool.ts                      # Main implementation
├── weatherTool.test.ts                 # Test suite
├── weatherToolStandalone.example.ts    # Standalone examples
├── WEATHER_TOOL_README.md              # Full documentation
└── WEATHER_INTEGRATION_GUIDE.md        # Integration guide

expense-tracker-api/
└── WEATHER_TOOL_SUMMARY.md             # This file
```

## ✅ Checklist

Before using the weather tool:

- [ ] Get OpenWeatherMap API key
- [ ] Add `OPENWEATHER_API_KEY` to `.env`
- [ ] Run test suite to verify setup
- [ ] (Optional) Integrate with AI agent
- [ ] (Optional) Customize units/settings

## 🎓 Learning Resources

1. **Start here**: `WEATHER_TOOL_README.md` - Learn the basics
2. **Try examples**: `weatherToolStandalone.example.ts` - See it in action
3. **Run tests**: `weatherTool.test.ts` - Verify everything works
4. **Integrate**: `WEATHER_INTEGRATION_GUIDE.md` - Add to your AI agent

## 🤝 Support

For issues:
- Check `WEATHER_TOOL_README.md` troubleshooting section
- Review example files for usage patterns
- Verify API key is correctly configured
- Check OpenWeatherMap API status

## 📄 License

This tool is part of the expense-tracker project.

---

**Ready to get started?** 

1. Add your API key to `.env`
2. Run `npx ts-node src/services/weatherTool.test.ts`
3. See the magic happen! ✨

For detailed documentation, see `src/services/WEATHER_TOOL_README.md`

