'use client';

import {
  Alert,
  Box,
  Button,
  Paper,
  Skeleton,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { QUERY_KEYS, ROUTES } from '../common/consts';

type NumberPair = {
  id1: number;
  number1: number;
  id2: number;
  number2: number;
  sum: number;
};

export default function NumbersPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [value, setValue] = useState<string>('');
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const {
    data = [],
    isLoading,
    isFetched,
  } = useQuery<NumberPair[]>({
    queryKey: [QUERY_KEYS.NUMBER_PAIRS],
    queryFn: async () => {
      const response = await fetch(ROUTES.NUMBERS);
      if (!response.ok) {
        throw new Error('Failed to fetch number pairs');
      }
      return response.json();
    },
  });
  const pairs = (data || []) as NumberPair[];
  const { mutate } = useMutation({
    gcTime: 0,
    mutationFn: async (newValue: number) => {
      const response = await fetch(ROUTES.NUMBERS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ value: newValue }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add number');
      }
      return response.json();
    },
    onSuccess: () => {
      setValue('');
      setSuccess('Number added successfully');
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.NUMBER_PAIRS],
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate input
    if (!value.trim() || !Number.isInteger(Number(value))) {
      setError('Please enter a valid integer');
      return;
    }

    const newValue = Number(value);
    mutate(newValue);
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Number Pairs Calculator
      </Typography>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <form onSubmit={handleSubmit}>
          <Typography variant="h6" gutterBottom>
            Add a new number
          </Typography>

          <Box
            sx={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              gap: 2,
              alignItems: isMobile ? 'stretch' : 'center',
            }}
          >
            <TextField
              label="Enter an integer"
              variant="outlined"
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              required
              fullWidth
              sx={{ maxWidth: isMobile ? '100%' : 300 }}
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isLoading}
              loading={isLoading}
              sx={{ width: isMobile ? '100%' : 'auto' }}
            >
              Add
            </Button>
          </Box>
        </form>
      </Paper>

      <Typography variant="h5" gutterBottom>
        Adjacent Number Pairs
      </Typography>

      <TableContainer
        component={Paper}
        data-testid="table-container"
        sx={{
          overflowX: 'auto',
          '.MuiTableCell-root': {
            whiteSpace: 'nowrap',
            px: isMobile ? 1 : 2,
          },
        }}
      >
        <Table size={isMobile ? 'small' : 'medium'}>
          <TableHead>
            <TableRow>
              <TableCell data-testid="ID-1">ID 1</TableCell>
              <TableCell data-testid="Number-1">Number 1</TableCell>
              <TableCell data-testid="ID-2">ID 2</TableCell>
              <TableCell data-testid="Number-2">Number 2</TableCell>
              <TableCell data-testid="Sum">Sum</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!isLoading && isFetched && pairs?.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography variant="body1" color="textSecondary">
                    No number pairs found. Please add a number to get started.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            {isLoading
              ? Array.from(new Array(4)).map((_, index) => (
                  <TableRow key={`skeleton-${index}`}>
                    <TableCell>
                      <Skeleton
                        animation="wave"
                        data-testid="pair-number-skeleton"
                      />
                    </TableCell>
                    <TableCell>
                      <Skeleton
                        animation="wave"
                        data-testid="pair-number-skeleton"
                      />
                    </TableCell>
                    <TableCell>
                      <Skeleton
                        animation="wave"
                        data-testid="pair-number-skeleton"
                      />
                    </TableCell>
                    <TableCell>
                      <Skeleton
                        animation="wave"
                        data-testid="pair-number-skeleton"
                      />
                    </TableCell>
                    <TableCell>
                      <Skeleton
                        animation="wave"
                        data-testid="pair-number-skeleton"
                      />
                    </TableCell>
                  </TableRow>
                ))
              : pairs.map((pair, index) => (
                  <TableRow key={index}>
                    <TableCell>{pair.id1}</TableCell>
                    <TableCell>{pair.number1}</TableCell>
                    <TableCell>{pair.id2}</TableCell>
                    <TableCell>{pair.number2}</TableCell>
                    <TableCell>{pair.sum}</TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>

      {/* Success Snackbar */}
      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
}
