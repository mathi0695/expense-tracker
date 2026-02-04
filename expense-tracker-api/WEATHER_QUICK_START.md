# Weather Tool - Quick Start Guide

Get up and running with the weather tool in 5 minutes! ⚡

## 🚀 Super Quick Start (3 Steps)

### 1. Get API Key
Visit https://openweathermap.org/api → Sign up → Copy API key

### 2. Add to .env
```bash
echo "OPENWEATHER_API_KEY=your_api_key_here" >> expense-tracker-api/.env
```

### 3. Test It!
```bash
cd expense-tracker-api
npx ts-node src/services/weatherTool.test.ts
```

✅ Done! If tests pass, you're ready to use the weather tool.

---

## 📦 What You Get

Two standalone tools for AI agents:

1. **Get Current Weather** - Real-time weather conditions
2. **Get Weather Forecast** - 1-5 day forecasts

---

## 🎯 Quick Usage Examples

### Standalone (No AI Agent)

```typescript
import { createGetCurrentWeatherTool } from './services/weatherTool';

const tool = createGetCurrentWeatherTool();
const result = await tool.func({ 
  location: 'London,UK', 
  units: 'metric' 
});

console.log(JSON.parse(result));
// {
//   success: true,
//   data: { temperature: 15, description: "clear sky", ... },
//   message: "Current weather in London, UK: 15°C, clear sky..."
// }
```

### With AI Agent

```typescript
// In chatService.ts
import { createGetCurrentWeatherTool, createGetWeatherForecastTool } from './weatherTool';

const tools = [
  // ... your existing tools
  createGetCurrentWeatherTool(),
  createGetWeatherForecastTool(),
];
```

Now your AI can answer: "What's the weather in Tokyo?"

---

## 📁 Files Created

```
expense-tracker-api/
├── src/services/
│   ├── weatherTool.ts              ⭐ Main tool (uses axios)
│   ├── weatherTool.fetch.ts        ⭐ Alternative (no dependencies)
│   ├── weatherTool.test.ts         🧪 Test suite
│   └── weatherToolStandalone.example.ts  📚 Examples
│
├── WEATHER_QUICK_START.md          👈 You are here
├── WEATHER_TOOL_INSTALLATION.md    📖 Detailed installation
├── WEATHER_TOOL_SUMMARY.md         📋 Complete overview
│
└── src/services/
    ├── WEATHER_TOOL_README.md      📚 Full documentation
    └── WEATHER_INTEGRATION_GUIDE.md 🔧 Integration guide
```

---

## 🔧 Installation Options

### Option A: Axios Version (Recommended)
```bash
npm install axios @types/axios
```
Then use `weatherTool.ts`

### Option B: Native Fetch (Zero Dependencies)
Requires Node.js 18+
Use `weatherTool.fetch.ts` instead

---

## 🧪 Testing

### Run Full Test Suite
```bash
npx ts-node src/services/weatherTool.test.ts
```

### Run Examples
```bash
npx ts-node src/services/weatherToolStandalone.example.ts
```

### Quick Manual Test
```bash
cd expense-tracker-api
npx ts-node -e "
require('dotenv').config();
const { createGetCurrentWeatherTool } = require('./src/services/weatherTool.ts');
const tool = createGetCurrentWeatherTool();
tool.func({ location: 'Paris,FR' }).then(r => console.log(JSON.parse(r)));
"
```

---

## 💡 Common Use Cases

### 1. Current Weather Check
```typescript
const tool = createGetCurrentWeatherTool();
await tool.func({ location: 'New York,US', units: 'imperial' });
```

### 2. Trip Planning
```typescript
const tool = createGetWeatherForecastTool();
await tool.func({ location: 'Barcelona,ES', days: 5 });
```

### 3. AI Agent Conversation
```
User: "What's the weather in Tokyo?"
AI: [Calls get_current_weather]
AI: "It's currently 15°C in Tokyo with clear skies..."
```

---

## ⚙️ Configuration

### Required
```env
OPENWEATHER_API_KEY=your_api_key_here
```

### Optional Defaults
- Units: `metric` (Celsius)
- Forecast days: `3`
- Can override per request

---

## 🌍 Location Formats

All of these work:
- `"London"`
- `"London,UK"`
- `"New York,US"`
- `"Tokyo,JP"`

---

## 📊 API Response Format

### Current Weather
```json
{
  "success": true,
  "data": {
    "location": "London",
    "country": "UK",
    "temperature": 15,
    "feelsLike": 13,
    "humidity": 72,
    "description": "partly cloudy",
    "windSpeed": 4.5,
    "pressure": 1013,
    "visibility": 10,
    "cloudiness": 40
  },
  "message": "Current weather in London, UK: 15°C, partly cloudy..."
}
```

### Weather Forecast
```json
{
  "success": true,
  "location": "Paris",
  "country": "FR",
  "forecasts": [
    {
      "date": "2026-01-28",
      "temperature": { "min": 8, "max": 15, "avg": 12 },
      "description": "light rain",
      "humidity": 78,
      "windSpeed": 3.5,
      "precipitation": 60
    }
  ],
  "message": "3-day forecast for Paris, FR: ..."
}
```

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| "API key not configured" | Add `OPENWEATHER_API_KEY` to `.env` |
| "Cannot find module 'axios'" | Run `npm install axios` |
| "fetch is not defined" | Use axios version or upgrade to Node 18+ |
| "Location not found" | Use "City,Country" format |

---

## 📚 Learn More

- **Full Documentation**: `src/services/WEATHER_TOOL_README.md`
- **Installation Guide**: `WEATHER_TOOL_INSTALLATION.md`
- **Integration Guide**: `src/services/WEATHER_INTEGRATION_GUIDE.md`
- **Complete Overview**: `WEATHER_TOOL_SUMMARY.md`

---

## ✅ Checklist

- [ ] Get OpenWeatherMap API key
- [ ] Add to `.env` file
- [ ] Choose version (axios or fetch)
- [ ] Install dependencies (if using axios)
- [ ] Run tests
- [ ] (Optional) Integrate with AI agent
- [ ] Start using!

---

## 🎉 You're Ready!

The weather tool is now ready to use. Try it out:

```bash
npx ts-node src/services/weatherToolStandalone.example.ts
```

Or integrate it with your AI agent and ask:
- "What's the weather in Paris?"
- "Will it rain in London this week?"
- "What's the temperature in Tokyo?"

**Need help?** Check the documentation files listed above.

Happy coding! 🌤️

