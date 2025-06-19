'use client';

import {
  Alert,
  AppBar,
  Box,
  Button,
  Container,
  Snackbar,
  Toolbar,
  Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { QUERY_KEYS, ROUTES } from '../common/consts';

export default function Navigation() {
  const pathname = usePathname();
  const { isError } = useQuery({
    queryKey: [QUERY_KEYS.INIT],
    queryFn: async () => {
      const response = await fetch(ROUTES.INIT);
      if (!response.ok) {
        throw new Error('Failed to initialize tables');
      }
      return response.json();
    },
  });

  return (
    <AppBar position="static" color="primary" sx={{ mb: 4 }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, display: 'flex' }}
          >
            Full Stack Assessment
          </Typography>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              component={Link}
              href="/numbers"
              color="inherit"
              variant={pathname === '/numbers' ? 'outlined' : 'text'}
            >
              Numbers
            </Button>
            <Button
              component={Link}
              href="/grades"
              color="inherit"
              variant={pathname === '/grades' ? 'outlined' : 'text'}
            >
              Grades
            </Button>
          </Box>
        </Toolbar>
      </Container>

      <Snackbar
        open={isError}
        autoHideDuration={3000}
        onClose={() => {}}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error">
          Failed to initialize tables. Please check the server logs.
        </Alert>
      </Snackbar>
    </AppBar>
  );
}
