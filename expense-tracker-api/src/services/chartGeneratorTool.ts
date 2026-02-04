import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import Expense from '../models/Expense';
import Income from '../models/Income';
import mongoose from 'mongoose';
import OpenAI from 'openai';

/**
 * Chart Generator Tool for AI Agent
 * 
 * This tool generates visual charts/graphs using DALL-E-3 based on expense and income data.
 * It queries the database for the last 30 days of data and creates appropriate visualizations.
 */

/**
 * Schema for generating charts
 */
export const generateChartSchema = z.object({
  chartType: z.enum(['pie', 'bar', 'line', 'auto'])
    .describe('Type of chart to generate: pie (category breakdown), bar (comparison), line (trends over time), auto (AI decides based on data)'),
  period: z.enum(['week', 'month', 'quarter', 'year', 'custom'])
    .optional()
    .default('month')
    .describe('Time period for the chart data'),
  startDate: z.string().optional()
    .describe('Start date for custom period (YYYY-MM-DD format)'),
  endDate: z.string().optional()
    .describe('End date for custom period (YYYY-MM-DD format)'),
  includeIncome: z.boolean().optional().default(true)
    .describe('Include income data in the chart'),
  includeExpenses: z.boolean().optional().default(true)
    .describe('Include expense data in the chart'),
});

/**
 * Color palette for different categories
 */
const COLOR_PALETTE = [
  'Navy Blue', 'Sky Blue', 'Mint Green', 'Coral Pink', 'Lavender Purple',
  'Golden Yellow', 'Teal', 'Rose Red', 'Forest Green', 'Orange',
  'Indigo', 'Turquoise', 'Salmon', 'Olive Green', 'Crimson'
];

/**
 * Generate DALL-E prompt for chart creation
 */
function generateChartPrompt(data: {
  chartType: string;
  period: string;
  totalExpenses: number;
  totalIncome: number;
  expensesByCategory: any[];
  incomeBySource: any[];
  includeExpenses: boolean;
  includeIncome: boolean;
  start: Date;
  end: Date;
}): string {
  const {
    chartType,
    expensesByCategory,
    incomeBySource,
    includeExpenses,
    includeIncome,
  } = data;

  // Determine chart type
  let actualChartType = chartType;
  if (chartType === 'auto') {
    // Decide based on data
    if (expensesByCategory.length > 0 && incomeBySource.length > 0) {
      actualChartType = 'pie'; // Best for category breakdown
    } else if (expensesByCategory.length > 0) {
      actualChartType = 'pie';
    } else {
      actualChartType = 'bar';
    }
  }

  // Determine if it's 3D or flat based on chart type
  const is3D = actualChartType === 'pie';
  const chartStyle = is3D ? '3D pie chart' : `${actualChartType} chart`;

  // Build the data description
  let dataDescription = '';
  const allItems: Array<{ name: string; amount: number; percentage: string }> = [];

  if (includeExpenses && expensesByCategory.length > 0) {
    expensesByCategory.slice(0, 8).forEach((cat) => {
      allItems.push({
        name: cat.category,
        amount: cat.total,
        percentage: cat.percentage
      });
    });
  }

  if (includeIncome && incomeBySource.length > 0) {
    incomeBySource.slice(0, 5).forEach((src) => {
      allItems.push({
        name: src.source,
        amount: src.total,
        percentage: src.percentage
      });
    });
  }

  // Build data description with proper formatting
  dataDescription = allItems.map((item) => {
    return `'${item.name}' at $${item.amount.toFixed(0)} (${item.percentage}%)`;
  }).join(', ');

  // Build color scheme
  const colorScheme = allItems.map((item, index) => {
    const color = COLOR_PALETTE[index % COLOR_PALETTE.length];
    return `Use ${color} for '${item.name}'`;
  }).join(', ');

  // Determine title based on what's included
  let title = 'Monthly Spending Breakdown';
  if (includeExpenses && includeIncome) {
    title = 'Financial Overview';
  } else if (includeIncome) {
    title = 'Income Breakdown';
  }

  // Build the professional prompt
  const prompt = `Create a professional business infographic featuring a ${chartStyle} based on the following ${includeExpenses ? 'expenditure' : 'income'} data: ${dataDescription}.

VISUAL STYLE: Clean corporate design with a minimalist aesthetic.
- Color scheme: ${colorScheme}.
- Soft shadows and high-contrast labels.

LAYOUT: Place the title '${title}' at the top in a bold sans-serif font. Ensure all labels ($ amounts and percentages) are perfectly legible and correctly spelled next to their respective slices.

High-resolution 4K output on a clean white background.`;

  return prompt;
}

/**
 * Create a tool for generating financial charts
 */
export function createChartGeneratorTool(userId: string) {
  return new DynamicStructuredTool({
    name: 'generate_financial_chart',
    description: 'Generate a visual chart or graph showing financial data (expenses and income). MUST use this tool when users ask for: "graph", "chart", "pie chart", "bar chart", "visual", "visualize", "show visually", "diagram", "plot" or any visual representation of their financial data. This tool creates actual images using DALL-E-3 and returns an image URL that will be displayed in the chat. Default period is last 30 days.',
    schema: generateChartSchema,
    func: async ({ chartType, period = 'month', startDate, endDate, includeIncome = true, includeExpenses = true }) => {
      try {
        // Calculate date range (default: last 30 days)
        let start: Date;
        let end: Date = new Date();

        if (period === 'custom' && startDate && endDate) {
          start = new Date(startDate);
          end = new Date(endDate);
        } else {
          start = new Date();
          switch (period) {
            case 'week':
              start.setDate(start.getDate() - 7);
              break;
            case 'month':
              start.setDate(start.getDate() - 30);
              break;
            case 'quarter':
              start.setMonth(start.getMonth() - 3);
              break;
            case 'year':
              start.setFullYear(start.getFullYear() - 1);
              break;
            default:
              start.setDate(start.getDate() - 30);
          }
        }

        const userObjectId = new mongoose.Types.ObjectId(userId);

        // Query expenses
        let expensesByCategory: any[] = [];
        let totalExpenses = 0;

        if (includeExpenses) {
          const expenses = await Expense.find({
            userId: userObjectId,
            date: { $gte: start, $lte: end },
          }).populate('categoryId');

          totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

          // Group by category
          const categoryMap = new Map<string, { total: number; count: number }>();
          expenses.forEach((exp: any) => {
            const categoryName = exp.categoryId?.name || 'Uncategorized';
            const existing = categoryMap.get(categoryName) || { total: 0, count: 0 };
            categoryMap.set(categoryName, {
              total: existing.total + exp.amount,
              count: existing.count + 1,
            });
          });

          expensesByCategory = Array.from(categoryMap.entries()).map(([category, data]) => ({
            category,
            total: data.total,
            count: data.count,
            percentage: totalExpenses > 0 ? (data.total / totalExpenses * 100).toFixed(1) : 0,
          })).sort((a, b) => b.total - a.total);
        }

        // Query income
        let incomeBySource: any[] = [];
        let totalIncome = 0;

        if (includeIncome) {
          const incomes = await Income.find({
            userId: userObjectId,
            date: { $gte: start, $lte: end },
          });

          totalIncome = incomes.reduce((sum, inc) => sum + inc.amount, 0);

          // Group by source
          const sourceMap = new Map<string, { total: number; count: number }>();
          incomes.forEach((inc: any) => {
            const source = inc.source || 'Other';
            const existing = sourceMap.get(source) || { total: 0, count: 0 };
            sourceMap.set(source, {
              total: existing.total + inc.amount,
              count: existing.count + 1,
            });
          });

          incomeBySource = Array.from(sourceMap.entries()).map(([source, data]) => ({
            source,
            total: data.total,
            count: data.count,
            percentage: totalIncome > 0 ? (data.total / totalIncome * 100).toFixed(1) : 0,
          })).sort((a, b) => b.total - a.total);
        }

        // Generate DALL-E prompt based on data and chart type
        const prompt = generateChartPrompt({
          chartType,
          period,
          totalExpenses,
          totalIncome,
          expensesByCategory,
          incomeBySource,
          includeExpenses,
          includeIncome,
          start,
          end,
        });

        // Call DALL-E-3 API
        const openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        });
        
        const response = await openai.images.generate({
          model: 'gpt-image-1.5',
          prompt: prompt,
          n: 1,
          size: '1024x1024',
          quality: 'medium',
        });

        // Handle base64 response from gpt-image-1.5
        const b64Json = response.data?.[0]?.b64_json;

        if (!b64Json) {
          return JSON.stringify({
            success: false,
            error: 'Failed to generate chart image',
          });
        }

        // Convert base64 to data URL for frontend display
        const imageDataUrl = `data:image/png;base64,${b64Json}`;

        return JSON.stringify({
          success: true,
          imageUrl: imageDataUrl,
          chartType: chartType === 'auto' ? 'pie' : chartType,
          summary: {
            totalExpenses,
            totalIncome,
            netBalance: totalIncome - totalExpenses,
            period: `${start.toLocaleDateString()} to ${end.toLocaleDateString()}`,
          },
          message: `Generated ${chartType === 'auto' ? 'a' : chartType} chart for your financial data from ${start.toLocaleDateString()} to ${end.toLocaleDateString()}.`,
        });

      } catch (error: any) {
        console.error('Chart generation error:', error);
        return JSON.stringify({
          success: false,
          error: error.message || 'Failed to generate chart',
        });
      }
    },
  });
}

