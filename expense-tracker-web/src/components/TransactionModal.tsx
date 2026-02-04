import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  Alert,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import {
  TrendingUp as IncomeIcon,
  TrendingDown as ExpenseIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

interface Category {
  _id: string;
  name: string;
}

interface TransactionData {
  type: 'income' | 'expense';
  date: string;
  amount: number;
  categoryId?: string;
  source?: string;
  notes?: string;
}

interface TransactionModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (transaction: TransactionData) => Promise<void>;
  categories: Category[];
}

const TransactionModal = ({ open, onClose, onSave, categories }: TransactionModalProps) => {
  const { user } = useAuth();
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('expense');
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    categoryId: '',
    source: '',
    notes: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      // Reset form when modal opens
      setFormData({
        date: new Date().toISOString().split('T')[0],
        amount: '',
        categoryId: '',
        source: '',
        notes: '',
      });
      setError('');
      setTransactionType('expense');
    }
  }, [open]);

  const handleTypeChange = (_event: React.MouseEvent<HTMLElement>, newType: 'income' | 'expense' | null) => {
    if (newType !== null) {
      setTransactionType(newType);
      // Clear type-specific fields when switching
      setFormData({
        ...formData,
        categoryId: '',
        source: '',
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      setError('Amount must be greater than 0');
      return false;
    }

    const selectedDate = new Date(formData.date);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (selectedDate > today) {
      setError('Date cannot be in the future');
      return false;
    }

    if (transactionType === 'expense' && !formData.categoryId) {
      setError('Please select a category');
      return false;
    }

    if (transactionType === 'income' && !formData.source.trim()) {
      setError('Please enter an income source');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const transactionData: any = {
        type: transactionType,
        date: formData.date,
        amount: parseFloat(formData.amount),
        currency: user?.currency || 'USD',
        notes: formData.notes || undefined,
      };

      if (transactionType === 'expense') {
        transactionData.categoryId = formData.categoryId;
      } else {
        transactionData.source = formData.source.trim();
      }

      await onSave(transactionData);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Transaction</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Transaction Type Toggle */}
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
            <ToggleButtonGroup
              value={transactionType}
              exclusive
              onChange={handleTypeChange}
              aria-label="transaction type"
              fullWidth
            >
              <ToggleButton value="expense" aria-label="expense" color="error">
                <ExpenseIcon sx={{ mr: 1 }} />
                Expense
              </ToggleButton>
              <ToggleButton value="income" aria-label="income" color="success">
                <IncomeIcon sx={{ mr: 1 }} />
                Income
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              required
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Amount"
              name="amount"
              type="number"
              value={formData.amount}
              onChange={handleChange}
              required
              fullWidth
              inputProps={{ step: '0.01', min: '0.01' }}
            />

            {/* Conditional Fields Based on Transaction Type */}
            {transactionType === 'expense' ? (
              <TextField
                label="Category"
                name="categoryId"
                select
                value={formData.categoryId}
                onChange={handleChange}
                required
                fullWidth
              >
                {categories.map((category) => (
                  <MenuItem key={category._id} value={category._id}>
                    {category.name}
                  </MenuItem>
                ))}
              </TextField>
            ) : (
              <TextField
                label="Source"
                name="source"
                value={formData.source}
                onChange={handleChange}
                required
                fullWidth
                placeholder="e.g., Salary, Freelance, Investment"
              />
            )}

            <TextField
              label="Notes (Optional)"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              fullWidth
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color={transactionType === 'income' ? 'success' : 'primary'}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TransactionModal;

