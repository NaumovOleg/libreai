import IconButton from '@mui/material/IconButton';
import SendIcon from '@mui/icons-material/Send';
import Typography from '@mui/material/Typography';
import { useConfig } from '@hooks';
import { FC } from 'react';
type Props = {
  sendMessage: () => void;
};
export const BottomNavigation: FC<Props> = ({ sendMessage }) => {
  const { chatConfig } = useConfig();

  return (
    <div className="bottom-navigation navigation">
      <div className="panel">
        <Typography>Model: {chatConfig.model}</Typography>
      </div>
      <IconButton onClick={sendMessage} color="primary">
        <SendIcon />
      </IconButton>
    </div>
  );
};
