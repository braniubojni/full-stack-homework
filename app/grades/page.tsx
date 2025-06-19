'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Snackbar,
  CircularProgress,
  SelectChangeEvent,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import { useAppContext } from '../context/AppContext';

type Grade = {
  id: number;
  class: string;
  grade: number;
  created_at?: string;
};

export default function GradesPage() {
  const [className, setClassName] = useState<string>('');
  const [gradeValue, setGradeValue] = useState<string>('');
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { refreshTrigger, triggerRefresh } = useAppContext();

  // Calculate class statistics
  const classStatistics = {
    Math: {
      count: grades.filter((grade) => grade.class === 'Math').length,
      average: calculateAverage(
        grades.filter((grade) => grade.class === 'Math')
      ),
    },
    Science: {
      count: grades.filter((grade) => grade.class === 'Science').length,
      average: calculateAverage(
        grades.filter((grade) => grade.class === 'Science')
      ),
    },
    History: {
      count: grades.filter((grade) => grade.class === 'History').length,
      average: calculateAverage(
        grades.filter((grade) => grade.class === 'History')
      ),
    },
  };

  function calculateAverage(grades: Grade[]): number {
    if (grades.length === 0) return 0;
    const sum = grades.reduce((acc, curr) => acc + curr.grade, 0);
    return Math.round((sum / grades.length) * 10) / 10;
  }

  useEffect(() => {
    // Initialize database on component mount
    fetch('/api/init')
      .then((response) => {
        if (!response.ok) throw new Error('Failed to initialize database');
      })
      .catch((err) => {
        console.error('Database initialization error:', err);
      });
  }, []);

  useEffect(() => {
    // Fetch grades
    setLoading(true);
    fetch('/api/grades')
      .then((response) => {
        if (!response.ok) throw new Error('Failed to fetch grades');
        return response.json();
      })
      .then((data) => {
        setGrades(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching grades:', err);
        setError('Failed to load grades. Please try again.');
        setLoading(false);
      });
  }, [refreshTrigger]);

  const handleClassChange = (event: SelectChangeEvent) => {
    setClassName(event.target.value);
  };

  const handleGradeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setGradeValue(event.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate input
    if (!className) {
      setError('Please select a class');
      return;
    }

    const grade = Number(gradeValue);
    if (!Number.isInteger(grade) || grade < 0 || grade > 100) {
      setError('Grade must be an integer between 0 and 100');
      return;
    }

    try {
      const response = await fetch('/api/grades', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ class: className, grade }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add grade');
      }

      setClassName('');
      setGradeValue('');
      setSuccess('Grade added successfully');
      triggerRefresh(); // Refresh the table
    } catch (err) {
      console.error('Error adding grade:', err);
      setError(err instanceof Error ? err.message : 'Failed to add grade');
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Grade Management
      </Typography>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <form onSubmit={handleSubmit}>
          <Typography variant="h6" gutterBottom>
            Add a new grade
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel id="class-select-label">Class</InputLabel>
              <Select
                labelId="class-select-label"
                value={className}
                label="Class"
                onChange={handleClassChange}
                required
              >
                <MenuItem value="Math">Math</MenuItem>
                <MenuItem value="Science">Science</MenuItem>
                <MenuItem value="History">History</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Grade (0-100)"
              variant="outlined"
              type="number"
              value={gradeValue}
              onChange={handleGradeChange}
              inputProps={{ min: 0, max: 100 }}
              required
              sx={{ width: 150 }}
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              sx={{ height: 56 }}
            >
              Add Grade
            </Button>
          </Box>
        </form>
      </Paper>

      {/* Class Statistics */}
      <Typography variant="h5" gutterBottom>
        Class Statistics
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 4 }}>
        {Object.entries(classStatistics).map(([className, stats]) => (
          <Card key={className} sx={{ minWidth: 200, flex: '1 1 30%' }}>
            <CardContent>
              <Typography variant="h6">{className}</Typography>
              <Typography variant="body1">Grades: {stats.count}</Typography>
              <Typography variant="body1">
                Average: {stats.count > 0 ? `${stats.average}%` : 'N/A'}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Typography variant="h5" gutterBottom>
        All Grades
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : grades.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Class</TableCell>
                <TableCell>Grade</TableCell>
                <TableCell>Date Added</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {grades.map((grade) => (
                <TableRow key={grade.id}>
                  <TableCell>{grade.id}</TableCell>
                  <TableCell>{grade.class}</TableCell>
                  <TableCell>{grade.grade}</TableCell>
                  <TableCell>
                    {grade.created_at
                      ? new Date(grade.created_at).toLocaleDateString()
                      : 'N/A'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
          <Typography>
            No grades available. Add grades to see them here.
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
