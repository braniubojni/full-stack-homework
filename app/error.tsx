'use client';

import { Box, Typography, Button, Paper } from '@mui/material';
import { useEffect } from 'react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

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
        <Typography variant="h5" color="error" gutterBottom>
          Something went wrong!
        </Typography>

        <Typography variant="body1" sx={{ mb: 3 }}>
          We apologize for the inconvenience. An unexpected error has occurred.
        </Typography>

        <Button
          variant="contained"
          color="primary"
          onClick={reset}
          sx={{ mr: 2 }}
        >
          Try again
        </Button>

        <Button
          variant="outlined"
          color="secondary"
          onClick={() => (window.location.href = '/')}
        >
          Go to Home
        </Button>
      </Paper>
    </Box>
  );
}
