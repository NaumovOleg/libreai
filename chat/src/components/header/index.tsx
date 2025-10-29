import './styles.scss';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import SettingsIcon from '@mui/icons-material/Settings';
import ArrowBack from '@mui/icons-material/ArrowBack';
import Box from '@mui/material/Box';
import { useNavigate, useLocation } from 'react-router-dom';
import { useIndexing, useChat } from '@hooks';
import { BsDatabaseFillCheck } from 'react-icons/bs';
import { BsDatabaseFillDash } from 'react-icons/bs';
import { BsDatabaseFillExclamation } from 'react-icons/bs';
import { BsDatabaseFillDown } from 'react-icons/bs';
import Add from '@mui/icons-material/Add';

type InitialIndex = { indexed: number; total: number; error?: string };

export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { payload } = useIndexing();
  const { clearSession } = useChat();

  const calculated = Object.values(payload).reduce(
    (acc, val) => {
      acc.indexed = acc.indexed + (val.indexed ?? 0);
      acc.total = acc.total + (val.total ?? 0);
      if (val.error) {
        acc.error = val.error;
      }
      return acc;
    },
    { indexed: 0, total: 0 } as InitialIndex,
  );

  const dataBaseIcon = () => {
    if (!calculated || !calculated.total || calculated.indexed === 0)
      return <BsDatabaseFillDash className="db not-indexed" />;
    if (calculated.indexed === calculated.total) {
      return <BsDatabaseFillCheck className="db indexed" />;
    }
    if (payload.error) {
      return <BsDatabaseFillExclamation className="db error" />;
    }
    if (calculated.indexed) {
      return <BsDatabaseFillDown className="db in-progress" />;
    }
  };

  const showBackButton = !['/', '/chat'].includes(location.pathname);

  return (
    <AppBar className="header">
      <Toolbar className="toolbar">
        <Box sx={{ flexGrow: 1 }}>
          {showBackButton && (
            <IconButton
              onClick={() => navigate('/')}
              className="arrow-back button-container"
              color="inherit"
            >
              <ArrowBack />
            </IconButton>
          )}
          {!showBackButton && (
            <IconButton className="session-button" onClick={clearSession}>
              <Add />
            </IconButton>
          )}
        </Box>
        <IconButton
          onClick={() => navigate('/indexing')}
          className="button-container"
          color="inherit"
        >
          {dataBaseIcon()}
        </IconButton>
        <IconButton
          onClick={() => navigate('/settings')}
          className="button-container"
          color="inherit"
        >
          <SettingsIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};
