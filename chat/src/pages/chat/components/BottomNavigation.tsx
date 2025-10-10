import IconButton from '@mui/material/IconButton';
import SendIcon from '@mui/icons-material/Send';
import Typography from '@mui/material/Typography';
import { useConfig, useChat } from '@hooks';
import { FC } from 'react';
import { Switch } from '@elements';
import { Providers } from '@utils';

type Props = {
  sendMessage: () => void;
};
export const BottomNavigation: FC<Props> = ({ sendMessage }) => {
  const { chatConfig } = useConfig();
  const { provider, setProvider } = useChat();
  return (
    <div className="bottom-navigation navigation">
      <Switch
        onChange={(checked) => {
          setProvider(checked ? Providers.agent : Providers.ai);
        }}
        checked={provider === Providers.agent}
        label={provider === Providers.agent ? 'Agent' : 'Chat'}
      />
      <div className="panel">
        <Typography>{chatConfig.model}</Typography>
      </div>

      <IconButton onClick={sendMessage} color="primary">
        <SendIcon />
      </IconButton>
    </div>
  );
};
