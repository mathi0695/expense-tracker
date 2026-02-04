# Report Tool Integration Guide

Quick guide to integrate the report generation tool with your frontend application.

## 🚀 Quick Start

The report tool is **already integrated** with the AI agent! Users can generate reports by asking the chatbot.

## 💬 AI Agent Integration (Already Done!)

### Example Conversations

```
User: "Generate a report for this month"
AI: "I've generated your monthly financial report!
     Total Income: $3,500
     Total Expenses: $1,250
     Net Balance: $2,250
     
     Download your report here: /api/reports/download/65b8f9e7c4d3a2b1e0f12345
     Available formats: CSV, JSON"
```

```
User: "I need a financial summary from January 1 to January 31"
AI: [Generates custom report]
AI: "Your custom report is ready! ..."
```

```
User: "Export all my expenses and income"
AI: [Generates detailed report with all data]
```

## 🌐 Frontend Integration

### Step 1: Add Download Function

Create a utility function to download reports:

```typescript
// src/utils/reportDownload.ts
export const downloadReport = async (
  reportId: string, 
  format: 'csv' | 'json' = 'csv'
): Promise<void> => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Not authenticated');
  }

  try {
    const response = await fetch(
      `${API_URL}/reports/download/${reportId}?format=${format}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to download report');
    }

    // Get filename from Content-Disposition header or use default
    const contentDisposition = response.headers.get('Content-Disposition');
    const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
    const filename = filenameMatch?.[1] || `financial-report-${Date.now()}.${format}`;

    // Download the file
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Download error:', error);
    throw error;
  }
};
```

### Step 2: Extract Report ID from AI Response

```typescript
// src/utils/reportParser.ts
export const extractReportId = (message: string): string | null => {
  // Look for report ID in download URL
  const urlMatch = message.match(/\/api\/reports\/download\/([a-f0-9]{24})/);
  if (urlMatch) {
    return urlMatch[1];
  }
  
  // Look for explicit report ID mention
  const idMatch = message.match(/report ID:?\s*([a-f0-9]{24})/i);
  if (idMatch) {
    return idMatch[1];
  }
  
  return null;
};

export const hasReportId = (message: string): boolean => {
  return extractReportId(message) !== null;
};
```

### Step 3: Add Download Buttons to Chat UI

```typescript
// src/components/ChatMessage.tsx
import { downloadReport } from '../utils/reportDownload';
import { extractReportId, hasReportId } from '../utils/reportParser';

interface ChatMessageProps {
  message: string;
  role: 'user' | 'assistant';
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, role }) => {
  const [downloading, setDownloading] = useState(false);
  const reportId = role === 'assistant' ? extractReportId(message) : null;

  const handleDownload = async (format: 'csv' | 'json') => {
    if (!reportId) return;
    
    setDownloading(true);
    try {
      await downloadReport(reportId, format);
      // Optional: Show success toast
    } catch (error) {
      console.error('Download failed:', error);
      // Optional: Show error toast
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className={`message ${role}`}>
      <div className="message-content">
        {message}
      </div>
      
      {reportId && (
        <div className="download-buttons">
          <button 
            onClick={() => handleDownload('csv')}
            disabled={downloading}
            className="btn-download"
          >
            📊 Download CSV
          </button>
          <button 
            onClick={() => handleDownload('json')}
            disabled={downloading}
            className="btn-download"
          >
            📄 Download JSON
          </button>
        </div>
      )}
    </div>
  );
};
```

### Step 4: Add Styling

```css
/* src/components/ChatMessage.css */
.download-buttons {
  margin-top: 12px;
  display: flex;
  gap: 8px;
}

.btn-download {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-download:hover:not(:disabled) {
  background: #f5f5f5;
  border-color: #999;
}

.btn-download:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

## 🎨 Advanced: Custom Report Generation UI

Create a dedicated report generation page:

```typescript
// src/pages/Reports.tsx
import { useState } from 'react';
import { chatService } from '../services/chatService';
import { downloadReport } from '../utils/reportDownload';

export const ReportsPage = () => {
  const [reportType, setReportType] = useState<'monthly' | 'yearly' | 'custom'>('monthly');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [reportId, setReportId] = useState<string | null>(null);

  const generateReport = async () => {
    setLoading(true);
    try {
      let message = '';
      
      if (reportType === 'custom') {
        message = `Generate a financial report from ${startDate} to ${endDate}`;
      } else {
        message = `Generate a ${reportType} financial report`;
      }

      const response = await chatService.sendMessage({
        message,
        conversationId: 'reports-' + Date.now(),
      });

      // Extract report ID from response
      const id = extractReportId(response.data.message);
      setReportId(id);
    } catch (error) {
      console.error('Failed to generate report:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reports-page">
      <h1>Generate Financial Report</h1>
      
      <div className="report-form">
        <label>
          Report Type:
          <select value={reportType} onChange={(e) => setReportType(e.target.value as any)}>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
            <option value="custom">Custom Date Range</option>
          </select>
        </label>

        {reportType === 'custom' && (
          <>
            <label>
              Start Date:
              <input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)} 
              />
            </label>
            <label>
              End Date:
              <input 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)} 
              />
            </label>
          </>
        )}

        <button onClick={generateReport} disabled={loading}>
          {loading ? 'Generating...' : 'Generate Report'}
        </button>
      </div>

      {reportId && (
        <div className="download-section">
          <h2>Report Ready!</h2>
          <div className="download-buttons">
            <button onClick={() => downloadReport(reportId, 'csv')}>
              Download CSV
            </button>
            <button onClick={() => downloadReport(reportId, 'json')}>
              Download JSON
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
```

## 🔧 API Service Integration

Add to your API service:

```typescript
// src/services/api.ts
export const reportService = {
  /**
   * Download a report
   */
  async downloadReport(reportId: string, format: 'csv' | 'json' = 'csv'): Promise<Blob> {
    const response = await api.get(`/reports/download/${reportId}`, {
      params: { format },
      responseType: 'blob',
    });
    return response.data;
  },
};
```

## 📱 Mobile Considerations

For mobile apps, handle downloads differently:

```typescript
// src/utils/reportDownload.mobile.ts
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export const downloadReportMobile = async (
  reportId: string,
  format: 'csv' | 'json'
) => {
  const API_URL = 'your-api-url';
  const token = await AsyncStorage.getItem('token');
  
  const fileUri = FileSystem.documentDirectory + `report.${format}`;
  
  const downloadResult = await FileSystem.downloadAsync(
    `${API_URL}/reports/download/${reportId}?format=${format}`,
    fileUri,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (downloadResult.status === 200) {
    await Sharing.shareAsync(downloadResult.uri);
  }
};
```

## 🧪 Testing

### Test Report Generation

```typescript
// In your test file
describe('Report Generation', () => {
  it('should generate monthly report', async () => {
    const response = await chatService.sendMessage({
      message: 'Generate a monthly report',
      conversationId: 'test-123',
    });
    
    expect(response.data.message).toContain('report');
    expect(response.data.message).toMatch(/[a-f0-9]{24}/); // Report ID
  });
});
```

### Test Download

```typescript
it('should download report as CSV', async () => {
  const reportId = 'test-report-id';
  const blob = await reportService.downloadReport(reportId, 'csv');
  
  expect(blob.type).toBe('text/csv');
  expect(blob.size).toBeGreaterThan(0);
});
```

## 🎯 Best Practices

1. **Error Handling**: Always handle download errors gracefully
2. **Loading States**: Show loading indicators during generation/download
3. **Expiration Notice**: Inform users reports expire in 1 hour
4. **Format Selection**: Let users choose their preferred format
5. **Success Feedback**: Show confirmation when download completes

## 📊 Example User Flow

1. User asks AI: "Generate a monthly report"
2. AI generates report and returns report ID
3. Frontend detects report ID in response
4. Shows download buttons (CSV/JSON)
5. User clicks download button
6. File downloads automatically
7. User opens file in Excel/text editor

## 🔗 Related Documentation

- **Full Documentation**: `REPORT_TOOL_README.md`
- **API Reference**: See controller and routes files
- **Testing**: `src/services/reportTool.test.ts`

---

**Questions?** Check the main README or create an issue!

