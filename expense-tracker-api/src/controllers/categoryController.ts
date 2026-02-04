import { Request, Response } from 'express';
import Category from '../models/Category';

export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { type } = req.query;

    const filter: any = { userId, isArchived: false };
    if (type) {
      filter.type = type;
    }

    const categories = await Category.find(filter).sort({ name: 1 });

    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch categories' });
  }
};

export const getCategoryById = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const category = await Category.findOne({ _id: id, userId });

    if (!category) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch category' });
  }
};

export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { name, type } = req.body;

    if (!name || !type) {
      res.status(400).json({ message: 'Name and type are required' });
      return;
    }

    if (!['expense', 'income'].includes(type)) {
      res.status(400).json({ message: 'Type must be either expense or income' });
      return;
    }

    const category = await Category.create({
      name,
      type,
      userId,
      isDefault: false,
    });

    res.status(201).json({
      success: true,
      data: category,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Category with this name already exists' });
      return;
    }
    res.status(500).json({ message: error.message || 'Failed to create category' });
  }
};

export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      res.status(400).json({ message: 'Name is required' });
      return;
    }

    const category = await Category.findOneAndUpdate(
      { _id: id, userId, isDefault: false },
      { name },
      { new: true, runValidators: true }
    );

    if (!category) {
      res.status(404).json({ message: 'Category not found or cannot be updated' });
      return;
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Category with this name already exists' });
      return;
    }
    res.status(500).json({ message: error.message || 'Failed to update category' });
  }
};

export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const category = await Category.findOneAndDelete({
      _id: id,
      userId,
      isDefault: false,
    });

    if (!category) {
      res.status(404).json({ message: 'Category not found or cannot be deleted' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to delete category' });
  }
};

