import IconButton from '@mui/material/IconButton';
import SendIcon from '@mui/icons-material/Send';
import Typography from '@mui/material/Typography';
import { useConfig } from '@hooks';
export const BottomNavigation = () => {
  const { chatConfig } = useConfig();

  return (
    <div className="bottom-navigation navigation">
      <div className="panel">
        <Typography>Model: {chatConfig.model}</Typography>
      </div>
      <IconButton color="primary">
        <SendIcon />
      </IconButton>
    </div>
  );
};
