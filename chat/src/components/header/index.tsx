import './styles.scss';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import SettingsIcon from '@mui/icons-material/Settings';
import ArrowBack from '@mui/icons-material/ArrowBack';
import Box from '@mui/material/Box';
import { useNavigate, useLocation } from 'react-router-dom';
import { useIndexing } from '@hooks';
import { BsDatabaseFillCheck } from 'react-icons/bs';
import { BsDatabaseFillDash } from 'react-icons/bs';
import { BsDatabaseFillExclamation } from 'react-icons/bs';
import { BsDatabaseFillDown } from 'react-icons/bs';
export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { payload } = useIndexing();

  const dataBaseIcon = () => {
    if (!payload || !payload.total || payload.indexed === 0)
      return <BsDatabaseFillDash className="db not-indexed" />;
    if (payload.progress === 100) {
      return <BsDatabaseFillCheck className="db indexed" />;
    }
    if (payload.error) {
      return <BsDatabaseFillExclamation className="db error" />;
    }
    if (payload.indexed) {
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
