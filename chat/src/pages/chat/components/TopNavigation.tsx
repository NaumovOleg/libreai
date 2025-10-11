import { useChat } from '@hooks';
import IconButton from '@mui/material/IconButton';
import Add from '@mui/icons-material/Add';
export const TopNavigation = () => {
  const { clearSession } = useChat();

  return (
    <div className="top-navigation navigation">
      <div className="buttons">
        <IconButton onClick={clearSession} color="secondary">
          <Add />
        </IconButton>
      </div>
      <div className="sessions">test</div>
    </div>
  );
};
