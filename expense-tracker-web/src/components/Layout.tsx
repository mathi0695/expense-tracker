import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  IconButton,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  Avatar,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  TrendingDown as ExpenseIcon,
  TrendingUp as IncomeIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import FloatingActionButtons from './FloatingActionButtons';
import ChatDrawer from './ChatDrawer';
import TransactionModal from './TransactionModal';
import { categoryService, type Category } from '../services/categoryService';
import { expenseService } from '../services/expenseService';
import { incomeService } from '../services/incomeService';

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate('/login');
  };

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleSaveTransaction = async (transaction: any) => {
    try {
      if (transaction.type === 'expense') {
        await expenseService.createExpense({
          amount: transaction.amount,
          categoryId: transaction.categoryId,
          date: transaction.date,
          notes: transaction.notes,
        });
      } else {
        await incomeService.createIncome({
          amount: transaction.amount,
          source: transaction.source,
          date: transaction.date,
          notes: transaction.notes,
        });
      }
      // Refresh the current page data if needed
      window.location.reload();
    } catch (error) {
      console.error('Error saving transaction:', error);
      throw error;
    }
  };

  // Load categories for the modal
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await categoryService.getCategories();
        setCategories(response.data);
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };
    loadCategories();
  }, []);

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Expenses', icon: <ExpenseIcon />, path: '/expenses' },
    { text: 'Income', icon: <IncomeIcon />, path: '/income' },
  ];

  const getCurrentPath = () => {
    const path = location.pathname;
    if (path === '/') return '/';
    if (path.startsWith('/expenses')) return '/expenses';
    if (path.startsWith('/income')) return '/income';
    return '/';
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Top App Bar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          bgcolor: 'background.paper',
          color: 'text.primary',
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              fontWeight: 700,
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            💰 Expense Tracker
          </Typography>

          <IconButton onClick={handleMenuOpen} size="large">
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: 'primary.main',
                fontSize: '1rem',
              }}
            >
              {user?.name?.charAt(0).toUpperCase()}
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem disabled>
              <Typography variant="body2" color="text.secondary">
                {user?.email}
              </Typography>
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <LogoutIcon sx={{ mr: 1 }} fontSize="small" />
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pt: { xs: 8, sm: 9 },
          pb: { xs: 8, sm: 3 },
          px: { xs: 2, sm: 3 },
          bgcolor: 'background.default',
        }}
      >
        <Outlet />
      </Box>

      {/* Bottom Navigation for Mobile */}
      {isMobile && (
        <Paper
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
          }}
          elevation={3}
        >
          <BottomNavigation
            value={getCurrentPath()}
            onChange={(_event, newValue) => {
              navigate(newValue);
            }}
            showLabels
          >
            {menuItems.map((item) => (
              <BottomNavigationAction
                key={item.path}
                label={item.text}
                value={item.path}
                icon={item.icon}
              />
            ))}
          </BottomNavigation>
        </Paper>
      )}

      {/* Floating Action Buttons */}
      <FloatingActionButtons
        onChatClick={() => setChatOpen(true)}
        onAddClick={handleOpenModal}
        showAddButton={location.pathname === '/' || location.pathname === '/expenses'}
      />

      {/* Chat Drawer */}
      <ChatDrawer open={chatOpen} onClose={() => setChatOpen(false)} />

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

export default Layout;

