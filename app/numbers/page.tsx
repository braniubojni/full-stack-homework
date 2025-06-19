'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS, ROUTES } from '../common/consts';

type NumberPair = {
  id1: number;
  number1: number;
  id2: number;
  number2: number;
  sum: number;
};

export default function NumbersPage() {
  const [value, setValue] = useState<string>('');
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const { data: pairs = [], isLoading } = useQuery<NumberPair[]>({
    queryKey: [QUERY_KEYS.NUMBER_PAIRS],
    queryFn: async () => {
      const response = await fetch(ROUTES.NUMBERS);
      if (!response.ok) {
        throw new Error('Failed to fetch number pairs');
      }
      return response.json();
    },
    initialData: [],
  });
  const { mutate, isError } = useMutation({
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

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              label="Enter an integer"
              variant="outlined"
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              required
              fullWidth
              sx={{ maxWidth: 300 }}
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isLoading}
              loading={isLoading}
            >
              Add
            </Button>
          </Box>
        </form>
      </Paper>

      <Typography variant="h5" gutterBottom>
        Adjacent Number Pairs
      </Typography>
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}
      {pairs && pairs?.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID 1</TableCell>
                <TableCell>Number 1</TableCell>
                <TableCell>ID 2</TableCell>
                <TableCell>Number 2</TableCell>
                <TableCell>Sum</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pairs.map((pair, index) => (
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
      ) : (
        <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
          <Typography>
            No number pairs available. Add at least two numbers to see pairs.
          </Typography>
        </Paper>
      )}

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
