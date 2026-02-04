import { Fab, Badge, Tooltip } from '@mui/material';
import { Chat as ChatIcon } from '@mui/icons-material';

interface FloatingChatButtonProps {
  onClick: () => void;
  hasUnread?: boolean;
}

const FloatingChatButton = ({ onClick, hasUnread = false }: FloatingChatButtonProps) => {
  return (
    <Tooltip title="Chat with AI Assistant" placement="left">
      <Fab
        color="primary"
        aria-label="chat"
        onClick={onClick}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000,
          boxShadow: 3,
          '&:hover': {
            transform: 'scale(1.1)',
            transition: 'transform 0.2s ease-in-out',
          },
        }}
      >
        <Badge color="error" variant="dot" invisible={!hasUnread}>
          <ChatIcon />
        </Badge>
      </Fab>
    </Tooltip>
  );
};

export default FloatingChatButton;

