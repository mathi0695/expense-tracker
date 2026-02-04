import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import Expense from '../models/Expense';
import Income from '../models/Income';
import Category from '../models/Category';
import mongoose from 'mongoose';

/**
 * Report Generation Tool for AI Agent
 *
 * This tool generates comprehensive financial reports by querying the database
 * and creating downloadable reports for expenses and income.
 */

// Declare global type for report cache
declare global {
  var reportCache: Map<string, any> | undefined;
}

export interface ReportData {
  reportId: string;
  userId: string;
  reportType: string;
  dateRange: {
    start: Date;
    end: Date;
  };
  summary: {
    totalExpenses: number;
    totalIncome: number;
    netBalance: number;
    expenseCount: number;
    incomeCount: number;
  };
  expensesByCategory: Array<{
    category: string;
    total: number;
    count: number;
    percentage: number;
  }>;
  incomeBySource: Array<{
    source: string;
    total: number;
    count: number;
    percentage: number;
  }>;
  monthlyTrends?: Array<{
    month: string;
    expenses: number;
    income: number;
    net: number;
  }>;
  topExpenses: Array<{
    date: string;
    category: string;
    amount: number;
    notes?: string;
  }>;
  createdAt: Date;
}

/**
 * Schema for generating financial reports
 */
export const generateReportSchema = z.object({
  reportType: z.enum(['summary', 'detailed', 'monthly', 'yearly', 'custom'])
    .describe('Type of report: summary (quick overview), detailed (all transactions), monthly (current month), yearly (current year), custom (date range)'),
  startDate: z.string().optional()
    .describe('Start date for custom reports (YYYY-MM-DD format). Required for custom report type.'),
  endDate: z.string().optional()
    .describe('End date for custom reports (YYYY-MM-DD format). Required for custom report type.'),
  includeCharts: z.boolean().optional().default(true)
    .describe('Include chart data for visualization'),
  groupBy: z.enum(['category', 'month', 'week', 'day']).optional().default('category')
    .describe('How to group the data in the report'),
});

/**
 * Create a tool for generating financial reports
 */
export function createGenerateReportTool(userId: string) {
  return new DynamicStructuredTool({
    name: 'generate_financial_report',
    description: 'Generate a comprehensive financial report with expenses and income data. The report can be downloaded by the user. Use this when users ask for reports, summaries, or want to download their financial data.',
    schema: generateReportSchema,
    func: async ({ reportType, startDate, endDate, includeCharts = true, groupBy = 'category' }) => {
      try {
        // Calculate date range based on report type
        let start: Date;
        let end: Date = new Date();

        switch (reportType) {
          case 'summary':
          case 'monthly':
            start = new Date();
            start.setMonth(start.getMonth() - 1);
            break;
          case 'yearly':
            start = new Date();
            start.setFullYear(start.getFullYear() - 1);
            break;
          case 'custom':
            if (!startDate || !endDate) {
              return JSON.stringify({
                success: false,
                error: 'Custom reports require both startDate and endDate parameters',
              });
            }
            start = new Date(startDate);
            end = new Date(endDate);
            
            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
              return JSON.stringify({
                success: false,
                error: 'Invalid date format. Use YYYY-MM-DD format.',
              });
            }
            
            if (start > end) {
              return JSON.stringify({
                success: false,
                error: 'Start date must be before end date',
              });
            }
            break;
          case 'detailed':
            start = new Date(0); // All time
            break;
          default:
            start = new Date();
            start.setMonth(start.getMonth() - 1);
        }

        const query = {
          userId: new mongoose.Types.ObjectId(userId),
          date: { $gte: start, $lte: end }
        };

        // Fetch expenses and income
        const [expenses, incomes] = await Promise.all([
          Expense.find(query).populate('categoryId', 'name').sort({ date: -1 }),
          Income.find(query).sort({ date: -1 })
        ]);

        // Calculate summary
        const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
        const totalIncome = incomes.reduce((sum, inc) => sum + inc.amount, 0);
        const netBalance = totalIncome - totalExpenses;

        // Group expenses by category
        const expensesByCategory: { [key: string]: { total: number; count: number } } = {};
        expenses.forEach(exp => {
          const catName = (exp.categoryId as any)?.name || 'Uncategorized';
          if (!expensesByCategory[catName]) {
            expensesByCategory[catName] = { total: 0, count: 0 };
          }
          expensesByCategory[catName].total += exp.amount;
          expensesByCategory[catName].count += 1;
        });

        const expensesByCategoryArray = Object.entries(expensesByCategory)
          .map(([category, data]) => ({
            category,
            total: Math.round(data.total * 100) / 100,
            count: data.count,
            percentage: totalExpenses > 0 ? Math.round((data.total / totalExpenses) * 100) : 0,
          }))
          .sort((a, b) => b.total - a.total);

        // Group income by source
        const incomeBySource: { [key: string]: { total: number; count: number } } = {};
        incomes.forEach(inc => {
          const source = inc.source || 'Other';
          if (!incomeBySource[source]) {
            incomeBySource[source] = { total: 0, count: 0 };
          }
          incomeBySource[source].total += inc.amount;
          incomeBySource[source].count += 1;
        });

        const incomeBySourceArray = Object.entries(incomeBySource)
          .map(([source, data]) => ({
            source,
            total: Math.round(data.total * 100) / 100,
            count: data.count,
            percentage: totalIncome > 0 ? Math.round((data.total / totalIncome) * 100) : 0,
          }))
          .sort((a, b) => b.total - a.total);

        // Get top 10 expenses
        const topExpenses = expenses.slice(0, 10).map(exp => ({
          date: exp.date.toISOString().split('T')[0],
          category: (exp.categoryId as any)?.name || 'Uncategorized',
          amount: exp.amount,
          notes: exp.notes,
        }));

        // Generate report ID for download
        const reportId = new mongoose.Types.ObjectId().toString();

        const reportData: ReportData = {
          reportId,
          userId,
          reportType,
          dateRange: { start, end },
          summary: {
            totalExpenses: Math.round(totalExpenses * 100) / 100,
            totalIncome: Math.round(totalIncome * 100) / 100,
            netBalance: Math.round(netBalance * 100) / 100,
            expenseCount: expenses.length,
            incomeCount: incomes.length,
          },
          expensesByCategory: expensesByCategoryArray,
          incomeBySource: incomeBySourceArray,
          topExpenses,
          createdAt: new Date(),
        };

        // Store report in memory cache for download (you can also use Redis or database)
        global.reportCache = global.reportCache || new Map();
        global.reportCache.set(reportId, {
          data: reportData,
          expenses: expenses.map(e => ({
            date: e.date,
            category: (e.categoryId as any)?.name,
            amount: e.amount,
            notes: e.notes,
          })),
          incomes: incomes.map(i => ({
            date: i.date,
            source: i.source,
            amount: i.amount,
            notes: i.notes,
          })),
          expiresAt: Date.now() + 3600000, // 1 hour
        });

        return JSON.stringify({
          success: true,
          reportId,
          summary: reportData.summary,
          message: `Report generated successfully! Period: ${start.toLocaleDateString()} to ${end.toLocaleDateString()}. Total Income: $${reportData.summary.totalIncome}, Total Expenses: $${reportData.summary.totalExpenses}, Net: $${reportData.summary.netBalance}. The user can download this report using the report ID: ${reportId}`,
          downloadUrl: `/api/reports/download/${reportId}`,
        });
      } catch (error: any) {
        return JSON.stringify({
          success: false,
          error: error.message || 'Failed to generate report',
        });
      }
    },
  });
}

