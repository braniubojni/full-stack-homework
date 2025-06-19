'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Container,
  Typography,
  Box,
} from '@mui/material';

export default function NumbersPage() {
  const [number, setNumber] = useState('');
  const [pairs, setPairs] = useState([]);

  const fetchPairs = async () => {
    const res = await fetch('/api/numbers');
    const data = await res.json();
    setPairs(data);
  };

  useEffect(() => {
    fetchPairs();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/numbers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ number: parseInt(number) }),
    });
    setNumber('');
    fetchPairs();
  };

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Numbers
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ mb: 2 }}>
        <TextField
          label="Enter a number"
          type="number"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          required
        />
        <Button type="submit" variant="contained" sx={{ ml: 2, mt: 1 }}>
          Add Number
        </Button>
      </Box>
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
            {pairs.map((pair: any, index: number) => (
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
    </Container>
  );
}
