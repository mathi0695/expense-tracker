import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Alert,
} from '@mui/material';
import type { Income } from '../services/incomeService';

interface IncomeFormData {
  date: string;
  amount: number;
  source: string;
  notes?: string;
}

interface IncomeModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (income: IncomeFormData) => Promise<void>;
  income?: Income | null;
}

const IncomeModal = ({ open, onClose, onSave, income }: IncomeModalProps) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    source: '',
    notes: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (income) {
      setFormData({
        date: new Date(income.date).toISOString().split('T')[0],
        amount: income.amount.toString(),
        source: income.source,
        notes: income.notes || '',
      });
    } else {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        amount: '',
        source: '',
        notes: '',
      });
    }
    setError('');
  }, [income, open]);

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

    if (!formData.source.trim()) {
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
      await onSave({
        date: formData.date,
        amount: parseFloat(formData.amount),
        source: formData.source.trim(),
        notes: formData.notes || undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save income');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{income ? 'Edit Income' : 'Add Income'}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
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
            <TextField
              label="Source"
              name="source"
              value={formData.source}
              onChange={handleChange}
              required
              fullWidth
              placeholder="e.g., Salary, Freelance, Investment"
            />
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
          <Button type="submit" variant="contained" color="success" disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default IncomeModal;

