# Financial Chart Generator Tool

AI-powered chart generation tool that creates visual representations of financial data using DALL-E-3.

## 🎨 Overview

This tool enables the AI agent to generate beautiful, professional charts and graphs showing expense and income data. When users ask for visual representations, the AI queries the database, analyzes the data, and generates a custom chart image using DALL-E-3.

## ✨ Features

### Chart Types
- **Pie Charts** - Category breakdown with percentages
- **Bar Charts** - Comparison between categories
- **Line Charts** - Trends over time
- **Auto** - AI decides the best chart type based on data

### Data Scope
- ✅ Last 30 days (default)
- ✅ Last week
- ✅ Last quarter
- ✅ Last year
- ✅ Custom date range
- ✅ Both expenses and income
- ✅ Expenses only
- ✅ Income only

### Visual Quality
- Professional, clean design
- Distinct colors for each category
- Clear labels with percentages and amounts
- Modern flat design (no 3D effects)
- High resolution (1024x1024)
- Readable on light and dark backgrounds

## 🚀 Usage

### AI Agent Queries

Users can ask the AI agent to generate charts using natural language:

**Examples:**
```
"Show me a graph of my expenses"
"Generate a chart for this month's spending"
"Create a visual breakdown of my expenses by category"
"Show me a pie chart of my income sources"
"I want to see a graph of my finances"
"Display my spending visually"
"Chart my expenses for the last 30 days"
```

### How It Works

1. **User asks for a chart** → AI detects intent
2. **AI calls chart generator tool** → Queries database for last 30 days
3. **Data analysis** → Groups by category, calculates percentages
4. **DALL-E prompt generation** → Creates detailed prompt with data
5. **Image generation** → DALL-E-3 creates the chart
6. **Display in chat** → Image URL returned and displayed

## 🔧 Technical Details

### Tool Parameters

```typescript
{
  chartType: 'pie' | 'bar' | 'line' | 'auto',  // Default: 'auto'
  period: 'week' | 'month' | 'quarter' | 'year' | 'custom',  // Default: 'month'
  startDate?: 'YYYY-MM-DD',  // For custom period
  endDate?: 'YYYY-MM-DD',    // For custom period
  includeIncome: boolean,    // Default: true
  includeExpenses: boolean,  // Default: true
}
```

### Response Format

```json
{
  "success": true,
  "imageUrl": "https://oaidalleapiprodscus.blob.core.windows.net/...",
  "chartType": "pie",
  "summary": {
    "totalExpenses": 1250.50,
    "totalIncome": 3500.00,
    "netBalance": 2249.50,
    "period": "1/1/2026 to 1/31/2026"
  },
  "message": "Generated pie chart for your financial data from 1/1/2026 to 1/31/2026."
}
```

## 📊 Chart Generation Process

### 1. Data Collection
- Queries MongoDB for expenses and income
- Filters by date range (default: last 30 days)
- Populates category information

### 2. Data Analysis
- Groups expenses by category
- Groups income by source
- Calculates totals and percentages
- Sorts by amount (highest first)

### 3. Prompt Generation
The tool creates a detailed DALL-E prompt:

```
Create a professional, clean financial chart with the following specifications:

Chart Type: PIE CHART
Period: 1/1/2026 to 1/31/2026

EXPENSES BY CATEGORY:
- Food: $450.00 (36%)
- Transport: $300.00 (24%)
- Entertainment: $200.00 (16%)
- Utilities: $150.00 (12%)
- Other: $150.50 (12%)
Total Expenses: $1250.50

INCOME BY SOURCE:
- Salary: $3000.00 (85.7%)
- Freelance: $500.00 (14.3%)
Total Income: $3500.00

Net Balance: $2249.50

DESIGN REQUIREMENTS:
- Use a clean, modern, professional design
- Use distinct colors for each category/segment
- Include clear labels with percentages and amounts
- Add a title at the top
- Use a white or light background
- Make text large and readable
- Include a legend if needed
- No 3D effects, keep it flat and modern
```

### 4. DALL-E-3 Generation
- Calls OpenAI DALL-E-3 API
- Model: `dall-e-3`
- Size: `1024x1024`
- Quality: `standard`

### 5. Frontend Display
- Image URL returned to AI agent
- AI responds with just the URL
- Frontend detects URL and displays image
- Fallback to text if image fails to load

## 🎯 Integration

### Backend (Already Integrated!)

**File:** `src/services/chartGeneratorTool.ts`
- ✅ Tool created
- ✅ Added to chatService.ts
- ✅ System message updated

### Frontend (Already Integrated!)

**File:** `src/components/ChatDrawer.tsx`
- ✅ Image URL detection
- ✅ Image rendering
- ✅ Fallback handling
- ✅ Responsive design

## 🔐 Security & Configuration

### Environment Variables

Required in `.env`:
```bash
OPENAI_API_KEY=sk-...  # Your OpenAI API key
```

### API Costs

DALL-E-3 pricing (as of 2026):
- Standard quality (1024x1024): ~$0.04 per image
- Each chart generation = 1 API call

**Cost optimization:**
- Images are not cached (generated fresh each time)
- Consider implementing image caching for production
- Monitor usage to control costs

## 📱 Frontend Display

### Image Detection

The frontend automatically detects image URLs in AI responses:

```typescript
const isImageUrl = (content: string): boolean => {
  const imageUrlPattern = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|bmp)$/i;
  const dalleUrlPattern = /^https?:\/\/.*openai\.com.*$/i;
  
  const trimmedContent = content.trim();
  return imageUrlPattern.test(trimmedContent) || dalleUrlPattern.test(trimmedContent);
};
```

### Image Rendering

```tsx
{extractImageUrl(message.content) && (
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
  />
)}
```

## 🧪 Testing

### Manual Testing

1. **Start the backend:**
```bash
cd expense-tracker-api
npm run dev
```

2. **Start the frontend:**
```bash
cd expense-tracker-web
npm run dev
```

3. **Test queries:**
- "Show me a graph of my expenses"
- "Generate a chart for this month"
- "Create a pie chart of my spending"

### Expected Behavior

1. User sends chart request
2. AI responds with "Generating your chart..."
3. Image appears in chat (takes 5-10 seconds)
4. Chart shows expense/income breakdown
5. Professional, clean design

## 🐛 Troubleshooting

### "Failed to generate chart image"

**Causes:**
- Invalid OpenAI API key
- Insufficient API credits
- Network issues
- DALL-E API downtime

**Solutions:**
- Check `OPENAI_API_KEY` in `.env`
- Verify API key has credits
- Check OpenAI status page
- Review server logs for errors

### Image not displaying in frontend

**Causes:**
- URL not detected correctly
- CORS issues
- Image URL expired

**Solutions:**
- Check browser console for errors
- Verify URL format in response
- DALL-E URLs expire after ~1 hour
- Regenerate the chart

### No data in chart

**Causes:**
- No transactions in date range
- Database connection issues
- User has no data

**Solutions:**
- Add some expenses/income first
- Check database connection
- Try different date range

## 🎨 Customization

### Change Default Period

```typescript
// In chartGeneratorTool.ts
period: 'week' | 'month' | 'quarter' | 'year'
// Change default from 'month' to your preference
```

### Modify Chart Styling

Edit the `generateChartPrompt` function to customize:
- Colors
- Layout
- Font sizes
- Background
- Legend position

### Add More Chart Types

```typescript
chartType: z.enum(['pie', 'bar', 'line', 'auto', 'donut', 'area'])
```

## 📈 Future Enhancements

- [ ] Cache generated images (reduce API costs)
- [ ] Support multiple chart types in one response
- [ ] Add chart download button
- [ ] Comparison charts (month-over-month)
- [ ] Trend analysis with predictions
- [ ] Budget vs actual charts
- [ ] Multi-currency support
- [ ] Custom color schemes
- [ ] Chart templates

## 💡 Best Practices

1. **Cost Management**
   - Monitor DALL-E API usage
   - Implement rate limiting
   - Cache frequently requested charts

2. **User Experience**
   - Show loading indicator while generating
   - Provide fallback if generation fails
   - Allow chart regeneration

3. **Data Quality**
   - Ensure sufficient data for meaningful charts
   - Handle edge cases (no data, single category)
   - Validate date ranges

## 📄 License

Part of the expense-tracker project.

