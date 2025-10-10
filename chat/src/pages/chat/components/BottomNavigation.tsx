import IconButton from '@mui/material/IconButton';
import SendIcon from '@mui/icons-material/Send';
import Typography from '@mui/material/Typography';
import { useConfig, useChat } from '@hooks';
import { FC } from 'react';
import { Popup, Button } from '@elements';
import { Author } from '@utils';
import { FaCheck } from 'react-icons/fa';

type Props = {
  sendMessage: () => void;
};
export const BottomNavigation: FC<Props> = ({ sendMessage }) => {
  const { chatConfig } = useConfig();
  const { provider, setProvider } = useChat();
  return (
    <div className="bottom-navigation navigation">
      <div className="left-side-block">
        <Popup label={provider} placement="top-start">
          <div className="state-toggle">
            <div className={`item ${provider === Author.chat && 'active'}`}>
              <FaCheck className="icon" />
              <Button label="Chat" onClick={() => setProvider(Author.chat)} />
            </div>
            <div className={`item ${provider === Author.agent && 'active'}`}>
              <FaCheck className="icon" />
              <Button label="Agent" onClick={() => setProvider(Author.agent)} />
            </div>
          </div>
        </Popup>
        <div className="panel">
          <Typography>{chatConfig.model}</Typography>
        </div>
      </div>

      <IconButton onClick={sendMessage} color="primary">
        <SendIcon />
      </IconButton>
    </div>
  );
};
