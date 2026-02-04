import { useState, useEffect } from 'react';
import { Typography, Box, Grid, Card, CardContent, Stack, Chip, Alert } from '@mui/material';
import {
  TrendingUp as IncomeIcon,
  TrendingDown as ExpenseIcon,
  AccountBalance as BalanceIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { expenseService, type Expense } from '../services/expenseService';
import { incomeService, type Income } from '../services/incomeService';
import { categoryService, type Category } from '../services/categoryService';
import TransactionModal from '../components/TransactionModal';
import { formatCurrency } from '../utils/currency';

type Transaction = (Expense | Income) & { type: 'expense' | 'income' };

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getCategories('expense');
      setCategories(response.data);
    } catch (err: any) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [incomeResponse, expenseResponse] = await Promise.all([
        incomeService.getIncomes({ limit: 10 }),
        expenseService.getExpenses({ limit: 10 }),
      ]);

      // Calculate totals
      const incomeTotal = incomeResponse.data.reduce((sum, income) => sum + income.amount, 0);
      const expenseTotal = expenseResponse.data.reduce((sum, expense) => sum + expense.amount, 0);

      setTotalIncome(incomeTotal);
      setTotalExpenses(expenseTotal);

      // Combine and sort recent transactions
      const transactions: Transaction[] = [
        ...incomeResponse.data.map(income => ({ ...income, type: 'income' as const })),
        ...expenseResponse.data.map(expense => ({ ...expense, type: 'expense' as const })),
      ];
      transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setRecentTransactions(transactions.slice(0, 5));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const balance = totalIncome - totalExpenses;
  const userCurrency = user?.currency || 'USD';

  const stats = [
    {
      title: 'Income',
      amount: formatCurrency(totalIncome, userCurrency),
      subtitle: 'Total',
      color: '#4caf50',
      bgColor: '#e8f5e9',
      icon: <IncomeIcon sx={{ fontSize: 40, color: '#4caf50' }} />,
    },
    {
      title: 'Expenses',
      amount: formatCurrency(totalExpenses, userCurrency),
      subtitle: 'Total',
      color: '#f44336',
      bgColor: '#ffebee',
      icon: <ExpenseIcon sx={{ fontSize: 40, color: '#f44336' }} />,
    },
    {
      title: 'Balance',
      amount: formatCurrency(balance, userCurrency),
      subtitle: 'Available',
      color: balance >= 0 ? '#2196f3' : '#f44336',
      bgColor: balance >= 0 ? '#e3f2fd' : '#ffebee',
      icon: <BalanceIcon sx={{ fontSize: 40, color: balance >= 0 ? '#2196f3' : '#f44336' }} />,
    },
  ];

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleSaveTransaction = async (transactionData: any) => {
    if (transactionData.type === 'expense') {
      await expenseService.createExpense({
        amount: transactionData.amount,
        categoryId: transactionData.categoryId,
        date: transactionData.date,
        notes: transactionData.notes,
      });
    } else {
      await incomeService.createIncome({
        amount: transactionData.amount,
        source: transactionData.source,
        date: transactionData.date,
        notes: transactionData.notes,
      });
    }
    // Refresh dashboard data
    await fetchDashboardData();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatAmount = (amount: number) => {
    const currency = user?.currency || 'USD';
    return formatCurrency(amount, currency);
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      {/* Welcome Header */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            mb: 0.5,
          }}
        >
          Welcome back, {user?.name}! 👋
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Here's your financial overview
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {stats.map((stat, index) => (
          <Grid key={index} size={{ xs: 12, sm: 4 }}>
            <Card
              elevation={0}
              sx={{
                height: '100%',
                border: 1,
                borderColor: 'divider',
                borderRadius: 2,
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 3,
                },
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: stat.color }}>
                      {stat.amount}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      bgcolor: stat.bgColor,
                      borderRadius: 2,
                      p: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {stat.icon}
                  </Box>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {stat.subtitle}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Recent Transactions */}
      <Card
        elevation={0}
        sx={{
          border: 1,
          borderColor: 'divider',
          borderRadius: 2,
        }}
      >
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Recent Transactions
          </Typography>
          {loading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">Loading...</Typography>
            </Box>
          ) : recentTransactions.length === 0 ? (
            <Box
              sx={{
                textAlign: 'center',
                py: 6,
                bgcolor: 'background.default',
                borderRadius: 2,
              }}
            >
              <Typography variant="body1" color="text.secondary" gutterBottom>
                No transactions yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Start by adding your income or expenses!
              </Typography>
            </Box>
          ) : (
            <Stack spacing={2}>
              {recentTransactions.map((transaction) => (
                <Card
                  key={transaction._id}
                  elevation={0}
                  sx={{
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 2,
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateX(4px)',
                    },
                  }}
                >
                  <CardContent sx={{ py: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Chip
                            label={transaction.type === 'income' ? 'Income' : 'Expense'}
                            size="small"
                            color={transaction.type === 'income' ? 'success' : 'error'}
                            sx={{ fontWeight: 600 }}
                          />
                          {transaction.type === 'expense' && 'categoryId' in transaction && (
                            <Chip
                              label={typeof transaction.categoryId === 'object' ? transaction.categoryId.name : ''}
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <CalendarIcon sx={{ fontSize: 16 }} />
                          {formatDate(transaction.date)}
                        </Typography>
                        {transaction.type === 'income' && 'source' in transaction && (
                          <Typography variant="body2" sx={{ mt: 0.5 }}>
                            {transaction.source}
                          </Typography>
                        )}
                        {transaction.notes && (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            {transaction.notes}
                          </Typography>
                        )}
                      </Box>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 700,
                          color: transaction.type === 'income' ? '#4caf50' : '#f44336',
                        }}
                      >
                        {transaction.type === 'income' ? '+' : '-'}
                        {formatAmount(transaction.amount)}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>

      {/* Transaction Modal */}
      <TransactionModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveTransaction}
        categories={categories}
      />
    </Box>
  );
};

export default Dashboard;

