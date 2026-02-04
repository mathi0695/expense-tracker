import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import Expense from '../models/Expense';
import Income from '../models/Income';
import Category from '../models/Category';
import mongoose from 'mongoose';

/**
 * Tool for getting user's expense categories
 */
export const getCategoriesToolSchema = z.object({
  type: z.enum(['expense', 'income']).optional().describe('Filter by category type'),
});

export function createGetCategoriesTool(userId: string) {
  return new DynamicStructuredTool({
    name: 'get_categories',
    description: 'Get the list of available expense or income categories for the user. Use this to find the correct category ID when creating expenses.',
    schema: getCategoriesToolSchema,
    func: async ({ type }) => {
      try {
        const filter: any = {
          userId: new mongoose.Types.ObjectId(userId),
          isArchived: false
        };
        if (type) {
          filter.type = type;
        }

        const categories = await Category.find(filter).sort({ name: 1 });

        return JSON.stringify({
          success: true,
          categories: categories.map(cat => ({
            id: cat._id.toString(),
            name: cat.name,
            type: cat.type,
          })),
        });
      } catch (error: any) {
        return JSON.stringify({
          success: false,
          error: error.message,
        });
      }
    },
  });
}

/**
 * Tool for creating an expense
 */
export const createExpenseToolSchema = z.object({
  amount: z.number().positive().describe('The expense amount (must be positive)'),
  categoryId: z.string().describe('The category ID for this expense. Use get_categories tool first to find the correct category ID.'),
  date: z.string().optional().describe('The date of the expense in ISO format (YYYY-MM-DD). Defaults to today if not provided.'),
  notes: z.string().optional().describe('Optional notes about the expense'),
});

export function createExpenseTool(userId: string) {
  return new DynamicStructuredTool({
    name: 'create_expense',
    description: 'Create a new expense record for the user. You must get the category ID first using get_categories tool. Parse dates like "today", "yesterday", "last Monday" into ISO format.',
    schema: createExpenseToolSchema,
    func: async ({ amount, categoryId, date, notes }) => {
      try {
        // Verify category exists and belongs to user
        const category = await Category.findOne({
          _id: new mongoose.Types.ObjectId(categoryId),
          userId: new mongoose.Types.ObjectId(userId),
          type: 'expense'
        });

        if (!category) {
          return JSON.stringify({
            success: false,
            error: 'Category not found or is not an expense category. Please use get_categories tool to find valid expense categories.',
          });
        }

        // Parse date or use today
        const expenseDate = date ? new Date(date) : new Date();

        // Create the expense
        const expense = await Expense.create({
          userId: new mongoose.Types.ObjectId(userId),
          amount,
          categoryId: new mongoose.Types.ObjectId(categoryId),
          date: expenseDate,
          notes,
        });

        const populatedExpense = await Expense.findById(expense._id).populate('categoryId', 'name');

        return JSON.stringify({
          success: true,
          message: `Successfully created expense of $${amount} for ${category.name}${date ? ` on ${new Date(date).toLocaleDateString()}` : ' today'}`,
          expense: {
            id: populatedExpense!._id.toString(),
            amount: populatedExpense!.amount,
            category: (populatedExpense!.categoryId as any).name,
            date: populatedExpense!.date.toISOString(),
            notes: populatedExpense!.notes,
          },
        });
      } catch (error: any) {
        return JSON.stringify({
          success: false,
          error: error.message || 'Failed to create expense',
        });
      }
    },
  });
}

/**
 * Tool for getting recent expenses
 */
export const getRecentExpensesToolSchema = z.object({
  limit: z.number().optional().default(10).describe('Number of recent expenses to retrieve (default: 10)'),
  categoryId: z.string().optional().describe('Filter by category ID'),
});

export function createGetRecentExpensesTool(userId: string) {
  return new DynamicStructuredTool({
    name: 'get_recent_expenses',
    description: 'Get the user\'s recent expenses. Useful for answering questions about spending patterns.',
    schema: getRecentExpensesToolSchema,
    func: async ({ limit = 10, categoryId }) => {
      try {
        const query: any = { userId: new mongoose.Types.ObjectId(userId) };
        if (categoryId) {
          query.categoryId = new mongoose.Types.ObjectId(categoryId);
        }

        const expenses = await Expense.find(query)
          .populate('categoryId', 'name')
          .sort({ date: -1 })
          .limit(limit);

        return JSON.stringify({
          success: true,
          expenses: expenses.map(exp => ({
            id: exp._id.toString(),
            amount: exp.amount,
            category: (exp.categoryId as any).name,
            date: exp.date.toISOString(),
            notes: exp.notes,
          })),
          total: expenses.reduce((sum, exp) => sum + exp.amount, 0),
        });
      } catch (error: any) {
        return JSON.stringify({
          success: false,
          error: error.message,
        });
      }
    },
  });
}


/**
 * Tool for creating income
 */
export const createIncomeToolSchema = z.object({
  amount: z.number().positive().describe('The income amount (must be positive)'),
  source: z.string().describe('The source of income (e.g., salary, freelance, investment, gift)'),
  date: z.string().optional().describe('The date of the income in ISO format (YYYY-MM-DD). Defaults to today if not provided.'),
  notes: z.string().optional().describe('Optional notes about the income'),
});

export function createIncomeTool(userId: string) {
  return new DynamicStructuredTool({
    name: 'create_income',
    description: 'Create a new income record for the user. Parse dates like "today", "yesterday" into ISO format.',
    schema: createIncomeToolSchema,
    func: async ({ amount, source, date, notes }) => {
      try {
        // Parse date or use today
        const incomeDate = date ? new Date(date) : new Date();

        // Create the income
        const income = await Income.create({
          userId: new mongoose.Types.ObjectId(userId),
          amount,
          source,
          date: incomeDate,
          notes,
        });

        return JSON.stringify({
          success: true,
          message: `Successfully recorded income of $${amount} from ${source}${date ? ` on ${new Date(date).toLocaleDateString()}` : ' today'}`,
          income: {
            id: income._id.toString(),
            amount: income.amount,
            source: income.source,
            date: income.date.toISOString(),
            notes: income.notes,
          },
        });
      } catch (error: any) {
        return JSON.stringify({
          success: false,
          error: error.message || 'Failed to create income',
        });
      }
    },
  });
}

/**
 * Tool for getting expense summary
 */
export const getExpenseSummaryToolSchema = z.object({
  period: z.enum(['week', 'month', 'year', 'all']).default('month').describe('Time period for summary (week, month, year, or all)'),
  groupBy: z.enum(['category', 'date', 'none']).optional().describe('How to group the results (category, date, or none)'),
});

export function createGetExpenseSummaryTool(userId: string) {
  return new DynamicStructuredTool({
    name: 'get_expense_summary',
    description: 'Get a summary of expenses for a time period, optionally grouped by category or date. Useful for answering "how much did I spend this month?" type questions.',
    schema: getExpenseSummaryToolSchema,
    func: async ({ period = 'month', groupBy }) => {
      try {
        // Calculate date range based on period
        const now = new Date();
        let startDate = new Date();

        switch (period) {
          case 'week':
            startDate.setDate(now.getDate() - 7);
            break;
          case 'month':
            startDate.setMonth(now.getMonth() - 1);
            break;
          case 'year':
            startDate.setFullYear(now.getFullYear() - 1);
            break;
          case 'all':
            startDate = new Date(0); // Beginning of time
            break;
        }

        const query: any = {
          userId: new mongoose.Types.ObjectId(userId),
          date: { $gte: startDate }
        };

        const expenses = await Expense.find(query)
          .populate('categoryId', 'name')
          .sort({ date: -1 });

        const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);

        let groupedData: any = null;
        if (groupBy === 'category') {
          const byCategory: any = {};
          expenses.forEach(exp => {
            const catName = (exp.categoryId as any).name;
            if (!byCategory[catName]) {
              byCategory[catName] = { total: 0, count: 0 };
            }
            byCategory[catName].total += exp.amount;
            byCategory[catName].count += 1;
          });
          groupedData = byCategory;
        }

        return JSON.stringify({
          success: true,
          period,
          total,
          count: expenses.length,
          groupedData,
          message: `Total spending for ${period}: $${total.toFixed(2)} across ${expenses.length} transactions`,
        });
      } catch (error: any) {
        return JSON.stringify({
          success: false,
          error: error.message,
        });
      }
    },
  });
}

/**
 * Tool for updating an expense
 */
export const updateExpenseToolSchema = z.object({
  expenseId: z.string().describe('The ID of the expense to update. Use get_recent_expenses to find it first.'),
  amount: z.number().positive().optional().describe('New amount for the expense'),
  categoryId: z.string().optional().describe('New category ID. Use get_categories to find valid category IDs.'),
  date: z.string().optional().describe('New date in ISO format (YYYY-MM-DD)'),
  notes: z.string().optional().describe('New notes for the expense'),
});

export function createUpdateExpenseTool(userId: string) {
  return new DynamicStructuredTool({
    name: 'update_expense',
    description: 'Update an existing expense. Use get_recent_expenses first to find the expense ID. At least one field must be provided to update.',
    schema: updateExpenseToolSchema,
    func: async ({ expenseId, amount, categoryId, date, notes }) => {
      try {
        // Verify expense exists and belongs to user
        const expense = await Expense.findOne({
          _id: new mongoose.Types.ObjectId(expenseId),
          userId: new mongoose.Types.ObjectId(userId),
        });

        if (!expense) {
          return JSON.stringify({
            success: false,
            error: 'Expense not found or does not belong to you.',
          });
        }

        // Build update object
        const updates: any = {};
        if (amount !== undefined) updates.amount = amount;
        if (categoryId !== undefined) {
          // Verify category exists and belongs to user
          const category = await Category.findOne({
            _id: new mongoose.Types.ObjectId(categoryId),
            userId: new mongoose.Types.ObjectId(userId),
            type: 'expense',
          });
          if (!category) {
            return JSON.stringify({
              success: false,
              error: 'Category not found or is not an expense category.',
            });
          }
          updates.categoryId = new mongoose.Types.ObjectId(categoryId);
        }
        if (date !== undefined) updates.date = new Date(date);
        if (notes !== undefined) updates.notes = notes;

        // Update the expense
        const updatedExpense = await Expense.findByIdAndUpdate(
          expenseId,
          updates,
          { new: true }
        ).populate('categoryId', 'name');

        return JSON.stringify({
          success: true,
          message: `Successfully updated expense`,
          expense: {
            id: updatedExpense!._id.toString(),
            amount: updatedExpense!.amount,
            category: (updatedExpense!.categoryId as any).name,
            date: updatedExpense!.date.toISOString(),
            notes: updatedExpense!.notes,
          },
        });
      } catch (error: any) {
        return JSON.stringify({
          success: false,
          error: error.message || 'Failed to update expense',
        });
      }
    },
  });
}

/**
 * Tool for deleting an expense
 */
export const deleteExpenseToolSchema = z.object({
  expenseId: z.string().describe('The ID of the expense to delete. Use get_recent_expenses to find it first.'),
});

export function createDeleteExpenseTool(userId: string) {
  return new DynamicStructuredTool({
    name: 'delete_expense',
    description: 'Delete an expense. Use get_recent_expenses first to find the expense ID. IMPORTANT: Ask for user confirmation before deleting.',
    schema: deleteExpenseToolSchema,
    func: async ({ expenseId }) => {
      try {
        // Verify expense exists and belongs to user
        const expense = await Expense.findOne({
          _id: new mongoose.Types.ObjectId(expenseId),
          userId: new mongoose.Types.ObjectId(userId),
        }).populate('categoryId', 'name');

        if (!expense) {
          return JSON.stringify({
            success: false,
            error: 'Expense not found or does not belong to you.',
          });
        }

        // Store details before deletion
        const expenseDetails = {
          amount: expense.amount,
          category: (expense.categoryId as any).name,
          date: expense.date.toISOString(),
          notes: expense.notes,
        };

        // Delete the expense
        await Expense.findByIdAndDelete(expenseId);

        return JSON.stringify({
          success: true,
          message: `Successfully deleted expense of $${expenseDetails.amount} for ${expenseDetails.category}`,
          deletedExpense: expenseDetails,
        });
      } catch (error: any) {
        return JSON.stringify({
          success: false,
          error: error.message || 'Failed to delete expense',
        });
      }
    },
  });
}

/**
 * Tool for searching expenses
 */
export const searchExpensesToolSchema = z.object({
  query: z.string().describe('Search query to match against expense notes (e.g., "Starbucks", "Amazon", "grocery")'),
  startDate: z.string().optional().describe('Start date for search range in ISO format (YYYY-MM-DD)'),
  endDate: z.string().optional().describe('End date for search range in ISO format (YYYY-MM-DD)'),
  limit: z.number().optional().default(20).describe('Maximum number of results to return (default: 20)'),
});

export function createSearchExpensesTool(userId: string) {
  return new DynamicStructuredTool({
    name: 'search_expenses',
    description: 'Search expenses by notes/description. Useful for finding specific transactions like "Starbucks", "Amazon", or "grocery store".',
    schema: searchExpensesToolSchema,
    func: async ({ query, startDate, endDate, limit = 20 }) => {
      try {
        // Build MongoDB query
        const mongoQuery: any = {
          userId: new mongoose.Types.ObjectId(userId),
          notes: { $regex: query, $options: 'i' }, // Case-insensitive search
        };

        // Add date filters if provided
        if (startDate || endDate) {
          mongoQuery.date = {};
          if (startDate) mongoQuery.date.$gte = new Date(startDate);
          if (endDate) mongoQuery.date.$lte = new Date(endDate);
        }

        const expenses = await Expense.find(mongoQuery)
          .populate('categoryId', 'name')
          .sort({ date: -1 })
          .limit(limit);

        const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);

        return JSON.stringify({
          success: true,
          query,
          count: expenses.length,
          total,
          expenses: expenses.map(exp => ({
            id: exp._id.toString(),
            amount: exp.amount,
            category: (exp.categoryId as any).name,
            date: exp.date.toISOString(),
            notes: exp.notes,
          })),
          message: `Found ${expenses.length} expense(s) matching "${query}" with total of $${total.toFixed(2)}`,
        });
      } catch (error: any) {
        return JSON.stringify({
          success: false,
          error: error.message,
        });
      }
    },
  });
}
