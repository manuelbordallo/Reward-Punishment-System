import { createTheme } from '@mui/material/styles';

// Create a custom Material-UI theme
export const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2', // Blue
            light: '#42a5f5',
            dark: '#1565c0',
        },
        secondary: {
            main: '#dc004e', // Pink/Red
            light: '#ff5983',
            dark: '#9a0036',
        },
        success: {
            main: '#2e7d32', // Green for rewards
            light: '#4caf50',
            dark: '#1b5e20',
        },
        warning: {
            main: '#ed6c02', // Orange for punishments
            light: '#ff9800',
            dark: '#e65100',
        },
        background: {
            default: '#f5f5f5',
            paper: '#ffffff',
        },
    },
    typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        h1: {
            fontSize: '2.5rem',
            fontWeight: 600,
            marginBottom: '1rem',
        },
        h2: {
            fontSize: '2rem',
            fontWeight: 500,
            marginBottom: '0.75rem',
        },
        h3: {
            fontSize: '1.5rem',
            fontWeight: 500,
            marginBottom: '0.5rem',
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none', // Disable uppercase transformation
                    borderRadius: 8,
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                },
            },
        },
        MuiTab: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontSize: '1rem',
                    fontWeight: 500,
                },
            },
        },
    },
});