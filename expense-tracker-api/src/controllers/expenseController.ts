import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Expense from '../models/Expense';
import Category from '../models/Category';
import User from '../models/User';

export const createExpense = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { amount, categoryId, date, notes, currency } = req.body;

    // Validation
    if (!amount || !categoryId) {
      res.status(400).json({ message: 'Amount and category are required' });
      return;
    }

    // Verify category belongs to user
    const category = await Category.findOne({ _id: categoryId, userId });
    if (!category) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }

    // Get user's default currency if not provided
    let expenseCurrency = currency;
    if (!expenseCurrency) {
      const user = await User.findById(userId);
      expenseCurrency = user?.currency || 'USD';
    }

    const expense = await Expense.create({
      userId,
      amount,
      currency: expenseCurrency,
      categoryId,
      date: date || new Date(),
      notes,
    });

    const populatedExpense = await Expense.findById(expense._id).populate('categoryId', 'name');

    res.status(201).json({
      success: true,
      message: 'Expense created successfully',
      data: populatedExpense,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to create expense' });
  }
};

export const getExpenses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { startDate, endDate, categoryId, page = 1, limit = 50 } = req.query;

    const query: any = { userId };

    // Date range filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate as string);
      if (endDate) query.date.$lte = new Date(endDate as string);
    }

    // Category filter
    if (categoryId) {
      query.categoryId = categoryId;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [expenses, total] = await Promise.all([
      Expense.find(query)
        .populate('categoryId', 'name')
        .sort({ date: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Expense.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: expenses,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch expenses' });
  }
};

export const getExpenseById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const expense = await Expense.findOne({ _id: id, userId }).populate('categoryId', 'name');

    if (!expense) {
      res.status(404).json({ message: 'Expense not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: expense,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch expense' });
  }
};

export const updateExpense = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { amount, categoryId, date, notes } = req.body;

    // Verify category if provided
    if (categoryId) {
      const category = await Category.findOne({ _id: categoryId, userId });
      if (!category) {
        res.status(404).json({ message: 'Category not found' });
        return;
      }
    }

    const expense = await Expense.findOneAndUpdate(
      { _id: id, userId },
      { amount, categoryId, date, notes },
      { new: true, runValidators: true }
    ).populate('categoryId', 'name');

    if (!expense) {
      res.status(404).json({ message: 'Expense not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Expense updated successfully',
      data: expense,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to update expense' });
  }
};

export const deleteExpense = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const expense = await Expense.findOneAndDelete({ _id: id, userId });

    if (!expense) {
      res.status(404).json({ message: 'Expense not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Expense deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to delete expense' });
  }
};

