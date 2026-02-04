# Financial Report Generation Tool

A comprehensive report generation tool for AI agents that queries the database and generates downloadable financial reports with expenses and income data.

## 🎯 Overview

This tool enables AI agents to generate detailed financial reports that users can download in multiple formats (CSV, JSON). The reports include:

- **Summary statistics** (total income, expenses, net balance)
- **Expenses grouped by category** with percentages
- **Income grouped by source** with percentages
- **Top expenses** list
- **All transactions** for the selected period

## 📦 Components

### 1. Report Tool (`src/services/reportTool.ts`)
- AI agent tool for generating reports
- Queries database for expenses and income
- Generates comprehensive analytics
- Creates downloadable report with unique ID

### 2. Report Controller (`src/controllers/reportController.ts`)
- Handles report download requests
- Supports multiple formats (CSV, JSON)
- Manages report cache and expiration
- Enforces user authentication and authorization

### 3. Report Routes (`src/routes/reportRoutes.ts`)
- REST API endpoint for downloading reports
- Integrated with authentication middleware

## 🚀 Features

### Report Types

1. **Summary Report** - Quick overview of last month
2. **Monthly Report** - Current month's data
3. **Yearly Report** - Last 12 months
4. **Detailed Report** - All-time data
5. **Custom Report** - Specific date range

### Export Formats

- **CSV** - Spreadsheet-friendly format
- **JSON** - Structured data for applications

### Analytics Included

- Total income and expenses
- Net balance (income - expenses)
- Transaction counts
- Expenses by category with percentages
- Income by source with percentages
- Top 10 largest expenses
- Complete transaction lists

## 🔧 Setup

### 1. Integration with AI Agent

The tool is already integrated with the chat service. No additional setup needed!

### 2. Database Requirements

Requires existing MongoDB collections:
- `expenses` - User expense records
- `incomes` - User income records
- `categories` - Expense categories

## 📖 Usage

### AI Agent Usage

Users can ask the AI agent to generate reports:

```
User: "Generate a report for this month"
AI: [Calls generate_financial_report with reportType='monthly']
AI: "I've generated your monthly financial report! 
     Total Income: $3,500, Total Expenses: $1,250, Net: $2,250.
     You can download it here: /api/reports/download/[reportId]"
```

### Example Queries

- "Generate a financial report for January"
- "Create a yearly report"
- "I need a report from Jan 1 to Jan 31"
- "Export my expenses and income"
- "Generate a summary of my finances"

### Tool Parameters

```typescript
{
  reportType: 'summary' | 'detailed' | 'monthly' | 'yearly' | 'custom',
  startDate?: 'YYYY-MM-DD',  // Required for custom reports
  endDate?: 'YYYY-MM-DD',    // Required for custom reports
  includeCharts?: boolean,   // Default: true
  groupBy?: 'category' | 'month' | 'week' | 'day'  // Default: 'category'
}
```

## 🌐 API Endpoints

### Download Report

```
GET /api/reports/download/:reportId?format=csv
```

**Authentication**: Required (Bearer token)

**Query Parameters**:
- `format` - Report format: `csv` or `json` (default: `json`)

**Response**: File download

**Example**:
```bash
curl -X GET "http://localhost:5000/api/reports/download/[reportId]?format=csv" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  --output report.csv
```

## 📊 Report Structure

### CSV Format

```csv
=== FINANCIAL REPORT ===
Generated: 2026-01-28 10:30:00
Period: 01/01/2026 to 01/31/2026

=== SUMMARY ===
Total Income,$3500
Total Expenses,$1250
Net Balance,$2250
Income Transactions,2
Expense Transactions,15

=== EXPENSES BY CATEGORY ===
Category,Amount,Count,Percentage
Food,$450,8,36%
Transport,$300,4,24%
...

=== ALL EXPENSES ===
Date,Category,Amount,Notes
01/15/2026,Food,$50,"Lunch at restaurant"
...
```

### JSON Format

```json
{
  "metadata": {
    "generatedAt": "2026-01-28T10:30:00Z",
    "reportId": "...",
    "reportType": "monthly",
    "dateRange": {
      "start": "2026-01-01",
      "end": "2026-01-31"
    }
  },
  "summary": {
    "totalIncome": 3500,
    "totalExpenses": 1250,
    "netBalance": 2250,
    "incomeCount": 2,
    "expenseCount": 15
  },
  "analytics": {
    "expensesByCategory": [...],
    "incomeBySource": [...],
    "topExpenses": [...]
  },
  "transactions": {
    "expenses": [...],
    "incomes": [...]
  }
}
```

## 🔒 Security

- **Authentication Required**: All endpoints require valid JWT token
- **User Authorization**: Users can only download their own reports
- **Report Expiration**: Reports expire after 1 hour
- **Cache Management**: Reports stored in memory cache (can be upgraded to Redis)

## 💾 Report Cache

Reports are temporarily cached for download:

- **Storage**: In-memory (global.reportCache)
- **Expiration**: 1 hour
- **Cleanup**: Automatic on access

For production, consider using Redis:
```typescript
// Example Redis integration
import Redis from 'ioredis';
const redis = new Redis();

// Store report
await redis.setex(`report:${reportId}`, 3600, JSON.stringify(reportData));

// Retrieve report
const reportData = await redis.get(`report:${reportId}`);
```

## 🧪 Testing

### Run Test Suite

```bash
cd expense-tracker-api
npx ts-node src/services/reportTool.test.ts
```

### Manual Testing

1. **Generate report via AI**:
```
User: "Generate a monthly report"
```

2. **Download via API**:
```bash
curl -X GET "http://localhost:5000/api/reports/download/[reportId]?format=csv" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  --output report.csv
```

## 📱 Frontend Integration

### Example React Component

```typescript
const downloadReport = async (reportId: string, format: 'csv' | 'json') => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(
    `${API_URL}/reports/download/${reportId}?format=${format}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `financial-report.${format}`;
  a.click();
};
```

### Example Usage in Chat

```typescript
// When AI returns a report ID
if (aiResponse.includes('reportId')) {
  const reportId = extractReportId(aiResponse);
  
  // Show download buttons
  <div>
    <button onClick={() => downloadReport(reportId, 'csv')}>
      Download CSV
    </button>
    <button onClick={() => downloadReport(reportId, 'json')}>
      Download JSON
    </button>
  </div>
}
```

## 🎨 Customization

### Add More Report Types

```typescript
// In reportTool.ts
case 'quarterly':
  start = new Date();
  start.setMonth(start.getMonth() - 3);
  break;
```

### Add PDF Export

Install dependencies:
```bash
npm install pdfkit
npm install --save-dev @types/pdfkit
```

Add PDF generation function in controller:
```typescript
function generatePDFReport(res: Response, filename: string, data: any) {
  const PDFDocument = require('pdfkit');
  const doc = new PDFDocument();
  
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}.pdf"`);
  
  doc.pipe(res);
  doc.fontSize(20).text('Financial Report', { align: 'center' });
  // ... add more content
  doc.end();
}
```

### Add Excel Export

Install dependencies:
```bash
npm install exceljs
```

## 🐛 Troubleshooting

### "Report not found or expired"
- Reports expire after 1 hour
- Generate a new report

### "Unauthorized access to this report"
- Report belongs to different user
- Check authentication token

### Empty report data
- No transactions in selected date range
- Check database has data for the user

### Download fails
- Check authentication token is valid
- Verify report ID is correct
- Check network connection

## 📈 Performance Considerations

- Reports are generated on-demand
- Large date ranges may take longer
- Consider pagination for very large datasets
- Use indexes on userId and date fields

## 🔄 Future Enhancements

- [ ] PDF export support
- [ ] Excel export support
- [ ] Email report delivery
- [ ] Scheduled reports
- [ ] Report templates
- [ ] Chart/graph generation
- [ ] Multi-currency support
- [ ] Budget comparison
- [ ] Trend analysis

## 📄 License

Part of the expense-tracker project.

