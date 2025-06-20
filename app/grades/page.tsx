'use client';

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
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

type Grade = {
  id: number;
  class: string;
  grade: number;
  created_at?: string;
};

export default function GradesPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const queryClient = useQueryClient();
  const [className, setClassName] = useState<string>('');
  const [gradeValue, setGradeValue] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { data = [], isLoading } = useQuery<Grade[]>({
    queryKey: [QUERY_KEYS.GRADES],
    queryFn: async () => {
      const response = await fetch(ROUTES.GRADES);
      if (!response.ok) {
        throw new Error('Failed to fetch grades');
      }
      return response.json();
    },
    initialData: [],
  });
  const grades = (data || []) as Grade[];
  const { mutate, isError } = useMutation({
    mutationFn: async (newGrade: { class: string; grade: number }) => {
      const response = await fetch(ROUTES.GRADES, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newGrade),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add grade');
      }
      return response.json();
    },
    onError: (error: Error) => {
      setError(error instanceof Error ? error.message : 'Failed to add grade');
    },
    onSuccess: () => {
      setClassName('');
      setGradeValue('');
      setSuccess('Grade added successfully');
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GRADES],
      });
    },
  });

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

  const handleClassChange = (event: SelectChangeEvent) => {
    setClassName(event.target.value);
  };

  const handleGradeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const val = event.target.value;
    if (!/^\d*$/.test(val) || Number(val) > 100 || Number(val) < 0) return;
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

    setError(null);
    setSuccess(null);
    mutate({ class: className, grade });
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

          <Box
            sx={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              gap: 2,
              flexWrap: 'wrap',
            }}
          >
            <FormControl
              sx={{ minWidth: 200, width: isMobile ? '100%' : 'auto' }}
            >
              <InputLabel id="class-select-label">Class</InputLabel>
              <Select
                labelId="class-select-label"
                value={className}
                label="Class"
                onChange={handleClassChange}
                required
              >
                <MenuItem data-testid="menu-option-Math" value="Math">
                  Math
                </MenuItem>
                <MenuItem data-testid="menu-option-Science" value="Science">
                  Science
                </MenuItem>
                <MenuItem data-testid="menu-option-History" value="History">
                  History
                </MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Grade (0-100)"
              variant="outlined"
              value={gradeValue}
              disabled={isLoading || isError || !className}
              onChange={handleGradeChange}
              required
              sx={{ width: isMobile ? '100%' : 150 }}
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isLoading}
              sx={{ height: 56, width: isMobile ? '100%' : 'auto' }}
            >
              Add Grade
            </Button>
          </Box>
        </form>
      </Paper>

      <Typography variant="h5" gutterBottom>
        Class Statistics
      </Typography>

      <Box
        sx={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: 2,
          flexWrap: 'wrap',
          mb: 4,
        }}
      >
        {isLoading ? (
          // Skeleton loaders for class statistics cards
          <>
            {['Math', 'Science', 'History'].map((className) => (
              <Card
                key={className}
                sx={{
                  minWidth: isMobile ? '100%' : 200,
                  flex: isMobile ? '1 1 100%' : '1 1 30%',
                }}
              >
                <CardContent>
                  <Skeleton variant="text" width="40%" height={32} />
                  <Skeleton variant="text" width="60%" />
                  <Skeleton variant="text" width="70%" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          // Actual class statistics cards
          Object.entries(classStatistics).map(([className, stats]) => (
            <Card
              key={className}
              sx={{
                minWidth: isMobile ? '100%' : 200,
                flex: isMobile ? '1 1 100%' : '1 1 30%',
              }}
              data-testid={`class-stat-${className}`}
            >
              <CardContent>
                <Typography variant="h6">{className}</Typography>
                <Typography variant="body1">Grades: {stats.count}</Typography>
                <Typography variant="body1">
                  Average: {stats.count > 0 ? `${stats.average}%` : 'N/A'}
                </Typography>
              </CardContent>
            </Card>
          ))
        )}
      </Box>

      <Typography variant="h5" gutterBottom>
        All Grades
      </Typography>

      {grades?.length > 0 || isLoading ? (
        <TableContainer
          component={Paper}
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
                <TableCell data-testid={'table-header-ID'}>ID</TableCell>
                <TableCell data-testid={'table-header-Class'}>Class</TableCell>
                <TableCell data-testid={'table-header-Grade'}>Grade</TableCell>
                <TableCell data-testid={'table-header-Date-Added'}>
                  Date Added
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading
                ? // Skeleton loading rows for the table
                  Array.from(new Array(5)).map((_, index) => (
                    <TableRow key={`skeleton-${index}`}>
                      <TableCell>
                        <Skeleton animation="wave" />
                      </TableCell>
                      <TableCell>
                        <Skeleton animation="wave" />
                      </TableCell>
                      <TableCell>
                        <Skeleton animation="wave" />
                      </TableCell>
                      <TableCell>
                        <Skeleton animation="wave" width="60%" />
                      </TableCell>
                    </TableRow>
                  ))
                : grades.map((grade) => (
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
        !isLoading && (
          <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
            <Typography>
              No grades available. Add grades to see them here.
            </Typography>
          </Paper>
        )
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
