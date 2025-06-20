'use client';

import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import {
  CssBaseline,
  ThemeProvider as MUIThemeProvider,
  createTheme,
} from '@mui/material';
import { FC, useMemo } from 'react';
import { ThemeProvider, useThemeContext } from '../context/ThemeContext';

type QueryProps = { children?: React.ReactNode };

const queryClient = new QueryClient();

const Providers: FC<QueryProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ThemeWrapper>{children}</ThemeWrapper>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

// This component handles applying the MUI theme based on our context
const ThemeWrapper: FC<QueryProps> = ({ children }) => {
  const { darkMode } = useThemeContext();

  // Create a theme instance.
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? 'dark' : 'light',
          primary: {
            main: darkMode ? '#90caf9' : '#1976d2',
          },
          secondary: {
            main: darkMode ? '#ce93d8' : '#9c27b0',
          },
          background: {
            default: darkMode ? '#121212' : '#ffffff',
            paper: darkMode ? '#1e1e1e' : '#ffffff',
          },
        },
      }),
    [darkMode]
  );

  return (
    <MUIThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MUIThemeProvider>
  );
};

export default Providers;
