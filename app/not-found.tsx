'use client';

import { Box, Typography, Button, Paper } from '@mui/material';
import Link from 'next/link';

export default function NotFound() {
  return (
    <Box
      sx={{
        p: 4,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '80vh',
      }}
    >
      <Paper elevation={3} sx={{ p: 4, maxWidth: 500, textAlign: 'center' }}>
        <Typography
          variant="h1"
          sx={{ fontSize: 100, fontWeight: 'bold', color: 'text.secondary' }}
        >
          404
        </Typography>

        <Typography variant="h5" sx={{ mb: 3 }}>
          Page Not Found
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          The page you are looking for does not exist or has been moved.
        </Typography>

        <Button component={Link} href="/" variant="contained" color="primary">
          Go to Home
        </Button>
      </Paper>
    </Box>
  );
}
