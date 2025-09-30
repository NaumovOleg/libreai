import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: { main: '#02315E' },
    secondary: { main: '#7adb30' },
    error: { main: '#f44336' },
    warning: { main: '#f38a4a' },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    action: {
      disabledBackground: '#f1eeeeff',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          height: '36px',
          borderRadius: '5px',
          fontSize: '0.75rem',
          top: 0,
          marginRight: '5px',
          '@media (max-width:600px)': {
            fontSize: '0.65rem',
          },
        },
        containedPrimary: {
          backgroundColor: '#2f70af', // Primary color
          '&:hover': {
            backgroundColor: '#1565c0', // Darker on hover
          },
        },
        containedSecondary: {
          backgroundColor: '#dc004e', // Secondary color
          '&:hover': {
            backgroundColor: '#b0003a',
          },
        },
        outlinedPrimary: {
          borderColor: '#1976d2',
          color: '#1976d2',
          '&:hover': {
            borderColor: '#1565c0',
            backgroundColor: 'rgba(25, 118, 210, 0.1)',
          },
        },
        outlinedSecondary: {
          borderColor: '#dc004e',
          color: '#dc004e',
          '&:hover': {
            borderColor: '#b0003a',
            backgroundColor: 'rgba(220, 0, 78, 0.1)',
          },
        },
        textPrimary: {
          color: '#1976d2',
          '&:hover': {
            backgroundColor: 'rgba(25, 118, 210, 0.1)',
          },
        },
        textSecondary: {
          color: '#dc004e',
          '&:hover': {
            backgroundColor: 'rgba(220, 0, 78, 0.1)',
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          margin: '5px 0px 5px 0px;',
          minWidth: 120,
          height: 25,
          minHeight: 25,
          padding: 0,
          boxSizing: 'border-box',
          backgroundColor: 'var(--vscode-input-background)',
          color: 'var(--vscode-input-foreground)',
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'var(--vscode-input-border)',
          },
          '&.Mui-focused': {
            borderColor: 'var(--vscode-focusBorder)',
          },
        },
        input: {
          minWidth: 120,
          height: 25,
          minHeight: 25,
          padding: '0 8px',
          backgroundColor: 'var(--vscode-input-background)',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          padding: 0,
          height: 25,
          minWidth: '150px',
        },
        input: {
          padding: '0 8px',
          backgroundColor: 'var(--vscode-input-background)',
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        select: {
          padding: '0 8px',
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          top: '0',
          color: 'var(--vscode-input-foreground)',
          fontSize: '0.75rem',
          lineHeight: '1.2',
          transform: 'translate(14px, 10px) scale(1)',
          transition: 'all 0.2s ease-in-out',
          '&.Mui-focused': {
            top: 5,
            color: 'var(--vscode-input-foreground)',
          },
          '&.MuiInputLabel-shrink': {
            // transform: 'translate(14px, -6px) scale(0.75)',
            top: '0',
            left: '11px',
            fontSize: '10px',
            transform: 'none',
          },
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: 'var(--vscode-input-background)',
          color: 'var(--vscode-input-foreground)',
          border: '1px solid var(--vscode-input-border)',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          height: 30,
          minHeight: 30,
          '&.Mui-selected': {
            backgroundColor: 'var(--vscode-focusBorder)',
            color: 'var(--vscode-input-background)',
          },
          '&.Mui-selected:hover': {
            backgroundColor: 'var(--vscode-inputOption-activeBackground)',
          },
          '&:hover': {
            backgroundColor: 'var(--vscode-inputOption-activeBackground)',
          },
        },
      },
    },
    MuiFormControl: {
      styleOverrides: {
        root: {
          width: '100%',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          border: '1px solid var(--vscode-foreground);',
          margin: '5px 1px',
          display: 'block',
          borderTop: '0.5px solid var(--vscode-foreground)',
          borderBottom: 0,
        },
      },
    },
  },
  typography: {
    fontSize: 14,
    h1: {
      fontSize: '15px',
      fontWeight: 600,
    },
    h2: {
      fontWeight: 600,
      fontSize: '14px',
    },
    h3: {
      fontWeight: 600,
      fontSize: '13px',
    },
    h4: {
      fontWeight: 600,
      fontSize: '12px',
    },
    h5: {
      fontSize: '11px',
    },
    body1: {
      fontSize: '12px',
    },
    body2: {
      fontSize: '10px',
    },
  },
});

export default theme;
