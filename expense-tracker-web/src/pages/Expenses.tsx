import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  Alert,
  Chip,
  Stack,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { expenseService, type Expense } from '../services/expenseService';
import { categoryService, type Category } from '../services/categoryService';
import ExpenseModal from '../components/ExpenseModal';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency } from '../utils/currency';

const Expenses: React.FC = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  useEffect(() => {
    fetchExpenses();
    fetchCategories();
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const response = await expenseService.getExpenses();
      setExpenses(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getCategories('expense');
      setCategories(response.data);
    } catch (err: any) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const handleOpenModal = (expense?: Expense) => {
    setSelectedExpense(expense || null);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedExpense(null);
  };

  const handleSaveExpense = async (expenseData: any) => {
    if (selectedExpense) {
      // Update existing expense
      const updated = await expenseService.updateExpense(selectedExpense._id, {
        amount: expenseData.amount,
        categoryId: expenseData.categoryId,
        date: expenseData.date,
        notes: expenseData.notes,
      });
      setExpenses(expenses.map(exp => exp._id === updated._id ? updated : exp));
    } else {
      // Create new expense
      const created = await expenseService.createExpense({
        amount: expenseData.amount,
        categoryId: expenseData.categoryId,
        date: expenseData.date,
        notes: expenseData.notes,
      });
      setExpenses([created, ...expenses]);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await expenseService.deleteExpense(id);
        setExpenses(expenses.filter((expense) => expense._id !== id));
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete expense');
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatAmount = (amount: number, currency?: string) => {
    const curr = currency || user?.currency || 'USD';
    return formatCurrency(amount, curr);
  };

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', position: 'relative' }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Expenses
        </Typography>
        {!isMobile && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            size="large"
            onClick={() => handleOpenModal()}
          >
            Add Expense
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Expense List */}
      {loading ? (
        <Card elevation={0} sx={{ border: 1, borderColor: 'divider', p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">Loading...</Typography>
        </Card>
      ) : expenses.length === 0 ? (
        <Card
          elevation={0}
          sx={{
            border: 1,
            borderColor: 'divider',
            p: 6,
            textAlign: 'center',
            bgcolor: 'background.default',
          }}
        >
          <Typography variant="h6" gutterBottom>
            No expenses yet
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Start tracking your expenses by adding your first one
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenModal()}
          >
            Add Your First Expense
          </Button>
        </Card>
      ) : (
        <Stack spacing={2}>
          {expenses.map((expense) => (
            <Card
              key={expense._id}
              elevation={0}
              sx={{
                border: 1,
                borderColor: 'divider',
                borderRadius: 2,
                transition: 'box-shadow 0.2s',
                '&:hover': {
                  boxShadow: 2,
                },
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Chip
                        label={expense.categoryId.name}
                        size="small"
                        color="error"
                        variant="outlined"
                      />
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <CalendarIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(expense.date)}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: 'error.main', mb: 0.5 }}>
                      {formatAmount(expense.amount, expense.currency)}
                    </Typography>
                    {expense.notes && (
                      <Typography variant="body2" color="text.secondary">
                        {expense.notes}
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleOpenModal(expense)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(expense._id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      {/* Expense Modal */}
      <ExpenseModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveExpense}
        expense={selectedExpense}
        categories={categories}
      />
    </Box>
  );
};

export default Expenses;

