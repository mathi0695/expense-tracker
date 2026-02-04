import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Income from '../models/Income';
import User from '../models/User';

export const createIncome = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { amount, source, date, notes, currency } = req.body;

    // Validation
    if (!amount || !source) {
      res.status(400).json({ message: 'Amount and source are required' });
      return;
    }

    // Get user's default currency if not provided
    let incomeCurrency = currency;
    if (!incomeCurrency) {
      const user = await User.findById(userId);
      incomeCurrency = user?.currency || 'USD';
    }

    const income = await Income.create({
      userId,
      amount,
      currency: incomeCurrency,
      source,
      date: date || new Date(),
      notes,
    });

    res.status(201).json({
      success: true,
      message: 'Income created successfully',
      data: income,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to create income' });
  }
};

export const getIncomes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { startDate, endDate, page = 1, limit = 50 } = req.query;

    const query: any = { userId };

    // Date range filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate as string);
      if (endDate) query.date.$lte = new Date(endDate as string);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [incomes, total] = await Promise.all([
      Income.find(query)
        .sort({ date: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Income.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: incomes,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch incomes' });
  }
};

export const getIncomeById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const income = await Income.findOne({ _id: id, userId });

    if (!income) {
      res.status(404).json({ message: 'Income not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: income,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch income' });
  }
};

export const updateIncome = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { amount, source, date, notes } = req.body;

    const income = await Income.findOneAndUpdate(
      { _id: id, userId },
      { amount, source, date, notes },
      { new: true, runValidators: true }
    );

    if (!income) {
      res.status(404).json({ message: 'Income not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Income updated successfully',
      data: income,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to update income' });
  }
};

export const deleteIncome = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const income = await Income.findOneAndDelete({ _id: id, userId });

    if (!income) {
      res.status(404).json({ message: 'Income not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Income deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to delete income' });
  }
};

