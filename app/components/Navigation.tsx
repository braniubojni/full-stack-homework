'use client';

import {
  AppBar,
  Box,
  Button,
  Container,
  Toolbar,
  Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();
  useQuery({
    queryKey: ['navigation'],
    queryFn: async () => fetch('/api/init'),
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
    </AppBar>
  );
}
