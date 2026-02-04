import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';

/**
 * Report Controller
 * Handles report generation and download requests
 */

/**
 * Download report in various formats (CSV, JSON)
 */
export const downloadReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { reportId } = req.params;
    const format = (req.query.format as string) || 'json';
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }

    // Get report from cache
    const reportCache = (global as any).reportCache;
    if (!reportCache || !reportCache.has(reportId)) {
      res.status(404).json({
        success: false,
        message: 'Report not found or expired. Please generate a new report.',
      });
      return;
    }

    const reportEntry = reportCache.get(reportId);

    // Check if report has expired
    if (Date.now() > reportEntry.expiresAt) {
      reportCache.delete(reportId);
      res.status(410).json({
        success: false,
        message: 'Report has expired. Please generate a new report.',
      });
      return;
    }

    // Verify the report belongs to the requesting user
    if (reportEntry.data.userId !== userId) {
      res.status(403).json({
        success: false,
        message: 'Unauthorized access to this report',
      });
      return;
    }

    const { data, expenses, incomes } = reportEntry;

    // Generate filename
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `financial-report-${dateStr}`;

    switch (format.toLowerCase()) {
      case 'csv':
        generateCSVReport(res, filename, data, expenses, incomes);
        break;
      case 'json':
        generateJSONReport(res, filename, data, expenses, incomes);
        break;
      default:
        res.status(400).json({
          success: false,
          message: 'Invalid format. Supported formats: csv, json',
        });
    }
  } catch (error: any) {
    console.error('Error in downloadReport:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to download report',
    });
  }
};

/**
 * Generate CSV format report
 */
function generateCSVReport(res: Response, filename: string, data: any, expenses: any[], incomes: any[]): void {
  let csv = '';

  // Header
  csv += '=== FINANCIAL REPORT ===\n';
  csv += `Generated: ${new Date().toLocaleString()}\n`;
  csv += `Period: ${new Date(data.dateRange.start).toLocaleDateString()} to ${new Date(data.dateRange.end).toLocaleDateString()}\n`;
  csv += '\n';

  // Summary
  csv += '=== SUMMARY ===\n';
  csv += `Total Income,$${data.summary.totalIncome}\n`;
  csv += `Total Expenses,$${data.summary.totalExpenses}\n`;
  csv += `Net Balance,$${data.summary.netBalance}\n`;
  csv += `Income Transactions,${data.summary.incomeCount}\n`;
  csv += `Expense Transactions,${data.summary.expenseCount}\n`;
  csv += '\n';

  // Expenses by Category
  csv += '=== EXPENSES BY CATEGORY ===\n';
  csv += 'Category,Amount,Count,Percentage\n';
  data.expensesByCategory.forEach((cat: any) => {
    csv += `${cat.category},$${cat.total},${cat.count},${cat.percentage}%\n`;
  });
  csv += '\n';

  // Income by Source
  csv += '=== INCOME BY SOURCE ===\n';
  csv += 'Source,Amount,Count,Percentage\n';
  data.incomeBySource.forEach((src: any) => {
    csv += `${src.source},$${src.total},${src.count},${src.percentage}%\n`;
  });
  csv += '\n';

  // All Expenses
  csv += '=== ALL EXPENSES ===\n';
  csv += 'Date,Category,Amount,Notes\n';
  expenses.forEach((exp: any) => {
    const notes = (exp.notes || '').replace(/,/g, ';').replace(/\n/g, ' ');
    csv += `${new Date(exp.date).toLocaleDateString()},${exp.category},$${exp.amount},"${notes}"\n`;
  });
  csv += '\n';

  // All Income
  csv += '=== ALL INCOME ===\n';
  csv += 'Date,Source,Amount,Notes\n';
  incomes.forEach((inc: any) => {
    const notes = (inc.notes || '').replace(/,/g, ';').replace(/\n/g, ' ');
    csv += `${new Date(inc.date).toLocaleDateString()},${inc.source},$${inc.amount},"${notes}"\n`;
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
  res.send(csv);
}

/**
 * Generate JSON format report
 */
function generateJSONReport(res: Response, filename: string, data: any, expenses: any[], incomes: any[]): void {
  const jsonReport = {
    metadata: {
      generatedAt: new Date().toISOString(),
      reportId: data.reportId,
      reportType: data.reportType,
      dateRange: {
        start: data.dateRange.start,
        end: data.dateRange.end,
      },
    },
    summary: data.summary,
    analytics: {
      expensesByCategory: data.expensesByCategory,
      incomeBySource: data.incomeBySource,
      topExpenses: data.topExpenses,
    },
    transactions: {
      expenses: expenses.map(exp => ({
        date: exp.date,
        category: exp.category,
        amount: exp.amount,
        notes: exp.notes,
      })),
      incomes: incomes.map(inc => ({
        date: inc.date,
        source: inc.source,
        amount: inc.amount,
        notes: inc.notes,
      })),
    },
  };

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}.json"`);
  res.json(jsonReport);
}

