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
  Fab,
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
import { incomeService, type Income } from '../services/incomeService';
import IncomeModal from '../components/IncomeModal';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency } from '../utils/currency';

const IncomePage: React.FC = () => {
  const { user } = useAuth();
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedIncome, setSelectedIncome] = useState<Income | null>(null);

  useEffect(() => {
    fetchIncomes();
  }, []);

  const fetchIncomes = async () => {
    try {
      setLoading(true);
      const response = await incomeService.getIncomes();
      setIncomes(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch incomes');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (income?: Income) => {
    setSelectedIncome(income || null);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedIncome(null);
  };

  const handleSaveIncome = async (incomeData: any) => {
    if (selectedIncome) {
      // Update existing income
      const updated = await incomeService.updateIncome(selectedIncome._id, {
        amount: incomeData.amount,
        source: incomeData.source,
        date: incomeData.date,
        notes: incomeData.notes,
      });
      setIncomes(incomes.map(inc => inc._id === updated._id ? updated : inc));
    } else {
      // Create new income
      const created = await incomeService.createIncome({
        amount: incomeData.amount,
        source: incomeData.source,
        date: incomeData.date,
        notes: incomeData.notes,
      });
      setIncomes([created, ...incomes]);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this income?')) {
      try {
        await incomeService.deleteIncome(id);
        setIncomes(incomes.filter((income) => income._id !== id));
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete income');
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
          Income
        </Typography>
        {!isMobile && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            size="large"
            color="success"
            onClick={() => handleOpenModal()}
          >
            Add Income
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Income List */}
      {loading ? (
        <Card elevation={0} sx={{ border: 1, borderColor: 'divider', p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">Loading...</Typography>
        </Card>
      ) : incomes.length === 0 ? (
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
            No income yet
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Start tracking your income by adding your first entry
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            color="success"
            onClick={() => handleOpenModal()}
          >
            Add Your First Income
          </Button>
        </Card>
      ) : (
        <Stack spacing={2}>
          {incomes.map((income) => (
            <Card
              key={income._id}
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
                        label={income.source}
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <CalendarIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(income.date)}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: 'success.main', mb: 0.5 }}>
                      {formatAmount(income.amount, income.currency)}
                    </Typography>
                    {income.notes && (
                      <Typography variant="body2" color="text.secondary">
                        {income.notes}
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleOpenModal(income)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(income._id)}
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

      {/* Floating Action Button for Mobile */}
      {isMobile && (
        <Fab
          color="success"
          aria-label="add"
          onClick={() => handleOpenModal()}
          sx={{
            position: 'fixed',
            bottom: 80,
            right: 16,
          }}
        >
          <AddIcon />
        </Fab>
      )}

      {/* Income Modal */}
      <IncomeModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveIncome}
        income={selectedIncome}
      />
    </Box>
  );
};

export default IncomePage;

