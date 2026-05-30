// MUI Theme Configuration
// Based on mockup.html design
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1B5E20',
      light: '#4C8C4A',
      dark: '#003300',
    },
    secondary: {
      main: '#1A237E',
    },
    success: {
      main: '#2E7D32',
    },
    warning: {
      main: '#F57C00',
    },
    error: {
      main: '#C62828',
    },
    info: {
      main: '#0277BD',
    },
    background: {
      default: '#F5F5F0',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#212121',
      secondary: '#616161',
    },
  },
  typography: {
    fontFamily: [
      'Noto Sans JP',
      'Roboto',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Arial',
      'sans-serif',
    ].join(','),
    fontSize: 14,
    h1: {
      fontSize: '18px',
      fontWeight: 500,
      letterSpacing: '0.02em',
    },
    h2: {
      fontSize: '17px',
      fontWeight: 500,
    },
    h3: {
      fontSize: '15px',
      fontWeight: 500,
    },
    body1: {
      fontSize: '14px',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '13px',
      lineHeight: 1.6,
    },
    caption: {
      fontSize: '12px',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          letterSpacing: '0.02em',
          borderRadius: '4px',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '4px',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '4px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
        },
      },
    },
  },
});

export default theme;
