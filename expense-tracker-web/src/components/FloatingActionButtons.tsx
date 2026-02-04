import { Box, Fab, Tooltip, useTheme, useMediaQuery } from '@mui/material';
import { Chat as ChatIcon, Add as AddIcon } from '@mui/icons-material';

interface FloatingActionButtonsProps {
  onChatClick: () => void;
  onAddClick?: () => void;
  showAddButton?: boolean;
}

const FloatingActionButtons = ({
  onChatClick,
  onAddClick,
  showAddButton = false,
}: FloatingActionButtonsProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: isMobile ? 80 : 24, // Higher on mobile to avoid bottom navigation
        right: 24,
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        alignItems: 'flex-end',
      }}
    >
      {/* Add Transaction Button (conditionally shown) */}
      {showAddButton && onAddClick && (
        <Tooltip title="Add Transaction" placement="left">
          <Fab
            color="secondary"
            aria-label="add transaction"
            onClick={onAddClick}
            sx={{
              boxShadow: 3,
              '&:hover': {
                transform: 'scale(1.1)',
                transition: 'transform 0.2s ease-in-out',
              },
            }}
          >
            <AddIcon />
          </Fab>
        </Tooltip>
      )}

      {/* Chat Button (always shown) */}
      <Tooltip title="Chat with AI Assistant" placement="left">
        <Fab
          color="primary"
          aria-label="chat"
          onClick={onChatClick}
          sx={{
            boxShadow: 3,
            '&:hover': {
              transform: 'scale(1.1)',
              transition: 'transform 0.2s ease-in-out',
            },
          }}
        >
          <ChatIcon />
        </Fab>
      </Tooltip>
    </Box>
  );
};

export default FloatingActionButtons;

