# Weather Tool Installation Guide

## Choose Your Version

Two versions of the weather tool are provided:

### Option 1: Using Axios (Recommended)
- **File**: `src/services/weatherTool.ts`
- **Pros**: More features, better error handling, widely used
- **Cons**: Requires installing axios dependency
- **Best for**: Production use, existing projects with axios

### Option 2: Using Native Fetch (Zero Dependencies)
- **File**: `src/services/weatherTool.fetch.ts`
- **Pros**: No additional dependencies, uses native Node.js fetch
- **Cons**: Requires Node.js 18+
- **Best for**: Minimal dependencies, modern Node.js projects

## Installation Steps

### Option 1: Axios Version (Recommended)

#### Step 1: Install Axios
```bash
cd expense-tracker-api
npm install axios
```

#### Step 2: Install Type Definitions
```bash
npm install --save-dev @types/axios
```

#### Step 3: Get OpenWeatherMap API Key
1. Visit https://openweathermap.org/api
2. Sign up for a free account
3. Navigate to API Keys section
4. Copy your API key

#### Step 4: Configure Environment
Add to your `.env` file:
```env
OPENWEATHER_API_KEY=your_api_key_here
```

#### Step 5: Test Installation
```bash
npx ts-node src/services/weatherTool.test.ts
```

#### Step 6: Use in Your Code
```typescript
import { createGetCurrentWeatherTool, createGetWeatherForecastTool } from './services/weatherTool';

const currentWeatherTool = createGetCurrentWeatherTool();
const forecastTool = createGetWeatherForecastTool();
```

---

### Option 2: Native Fetch Version (Zero Dependencies)

#### Step 1: Check Node.js Version
```bash
node --version
# Should be v18.0.0 or higher
```

If you're on an older version, either:
- Upgrade Node.js to v18+, OR
- Use Option 1 (Axios version)

#### Step 2: Get OpenWeatherMap API Key
1. Visit https://openweathermap.org/api
2. Sign up for a free account
3. Navigate to API Keys section
4. Copy your API key

#### Step 3: Configure Environment
Add to your `.env` file:
```env
OPENWEATHER_API_KEY=your_api_key_here
```

#### Step 4: Rename the File (Optional)
If you want to use this as the main version:
```bash
cd expense-tracker-api/src/services
mv weatherTool.ts weatherTool.axios.ts
mv weatherTool.fetch.ts weatherTool.ts
```

Or just import from the fetch version directly:
```typescript
import { createGetCurrentWeatherTool } from './services/weatherTool.fetch';
```

#### Step 5: Test Installation
Create a simple test file or modify the test file to import from `weatherTool.fetch`:
```typescript
import { createGetCurrentWeatherTool } from './weatherTool.fetch';

async function test() {
  const tool = createGetCurrentWeatherTool();
  const result = await tool.func({ location: 'London,UK' });
  console.log(JSON.parse(result));
}

test();
```

---

## Verification

After installation, verify everything works:

### Quick Test
```bash
cd expense-tracker-api
npx ts-node -e "
import('./src/services/weatherTool').then(async (module) => {
  const tool = module.createGetCurrentWeatherTool();
  const result = await tool.func({ location: 'London,UK' });
  console.log(JSON.parse(result));
});
"
```

### Full Test Suite
```bash
npx ts-node src/services/weatherTool.test.ts
```

### Standalone Examples
```bash
npx ts-node src/services/weatherToolStandalone.example.ts
```

---

## Troubleshooting

### "Cannot find module 'axios'"
**Solution**: Install axios
```bash
npm install axios
npm install --save-dev @types/axios
```

### "fetch is not defined"
**Solution**: You're using Node.js < 18. Either:
1. Upgrade to Node.js 18+
2. Use the axios version instead
3. Install node-fetch: `npm install node-fetch@3`

### "API key is not configured"
**Solution**: 
1. Check `.env` file exists in `expense-tracker-api/` directory
2. Verify the key is named exactly `OPENWEATHER_API_KEY`
3. Restart your application after adding the key
4. Make sure you're loading dotenv: `import dotenv from 'dotenv'; dotenv.config();`

### "Location not found"
**Solution**:
1. Use "City,CountryCode" format (e.g., "Paris,FR")
2. Check spelling
3. Try a major city first to verify the tool works

### TypeScript errors
**Solution**:
```bash
# Rebuild the project
npm run build

# Check for missing type definitions
npm install --save-dev @types/node
```

---

## Integration with AI Agent

After installation, integrate with your chat service:

```typescript
// In src/services/chatService.ts

// 1. Import the tools
import { 
  createGetCurrentWeatherTool, 
  createGetWeatherForecastTool 
} from './weatherTool';

// 2. Add to tools array in sendMessage method
const tools = [
  // Existing expense tools
  createGetCategoriesTool(userId),
  createExpenseTool(userId),
  // ... other tools
  
  // Weather tools
  createGetCurrentWeatherTool(),
  createGetWeatherForecastTool(),
];

// 3. Update system message (optional but recommended)
const systemMessage = new SystemMessage(
  `You are a helpful assistant that can help with expense tracking and weather information.
  
  For weather queries, use the weather tools to provide accurate, real-time information.
  For expense queries, use the expense tools to help users manage their finances.`
);
```

---

## Next Steps

1. ✅ Choose your version (axios or fetch)
2. ✅ Install dependencies (if using axios)
3. ✅ Get API key from OpenWeatherMap
4. ✅ Add API key to `.env`
5. ✅ Run tests to verify
6. ✅ Integrate with AI agent (optional)
7. ✅ Start using!

---

## Quick Reference

### Files Overview
```
expense-tracker-api/
├── src/services/
│   ├── weatherTool.ts                    # Axios version (recommended)
│   ├── weatherTool.fetch.ts              # Native fetch version
│   ├── weatherTool.test.ts               # Test suite
│   ├── weatherToolStandalone.example.ts  # Usage examples
│   ├── WEATHER_TOOL_README.md            # Full documentation
│   └── WEATHER_INTEGRATION_GUIDE.md      # Integration guide
├── WEATHER_TOOL_SUMMARY.md               # Overview
└── WEATHER_TOOL_INSTALLATION.md          # This file
```

### Commands
```bash
# Install axios (Option 1)
npm install axios @types/axios

# Test the tool
npx ts-node src/services/weatherTool.test.ts

# Run examples
npx ts-node src/services/weatherToolStandalone.example.ts

# Check Node version (Option 2)
node --version
```

### Environment Variables
```env
OPENWEATHER_API_KEY=your_api_key_here
```

---

## Support

- **Documentation**: See `src/services/WEATHER_TOOL_README.md`
- **Examples**: See `src/services/weatherToolStandalone.example.ts`
- **Integration**: See `src/services/WEATHER_INTEGRATION_GUIDE.md`
- **API Issues**: Visit https://openweathermap.org/faq

Happy coding! 🌤️

