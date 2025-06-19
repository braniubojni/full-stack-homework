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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';

export default function GradesPage() {
  const [grades, setGrades] = useState([]);
  const [className, setClassName] = useState('Math');
  const [grade, setGrade] = useState('');

  const fetchGrades = async () => {
    const res = await fetch('/api/grades');
    const data = await res.json();
    setGrades(data);
  };

  useEffect(() => {
    fetchGrades();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/grades', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ class: className, grade: parseInt(grade) }),
    });
    setClassName('Math');
    setGrade('');
    fetchGrades();
  };

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Grades
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ mb: 2 }}>
        <FormControl sx={{ minWidth: 120, mr: 2 }}>
          <InputLabel>Class</InputLabel>
          <Select
            value={className}
            onChange={(e) => setClassName(e.target.value)}
          >
            <MenuItem value="Math">Math</MenuItem>
            <MenuItem value="Science">Science</MenuItem>
            <MenuItem value="History">History</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="Grade"
          type="number"
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
          required
          inputProps={{ min: 0, max: 100 }}
        />
        <Button type="submit" variant="contained" sx={{ ml: 2, mt: 1 }}>
          Add Grade
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Class</TableCell>
              <TableCell>Grade</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {grades.map((g: any) => (
              <TableRow key={g.id}>
                <TableCell>{g.id}</TableCell>
                <TableCell>{g.class}</TableCell>
                <TableCell>{g.grade}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}
