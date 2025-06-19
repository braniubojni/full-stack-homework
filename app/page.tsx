import { redirect } from 'next/navigation';
import {
  Typography,
  Button,
  Container,
  Box,
  Card,
  CardContent,
} from '@mui/material';
import Link from 'next/link';

export default function Home() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom textAlign="center">
        Full Stack Developer Assessment
      </Typography>

      <Typography
        variant="h5"
        component="h2"
        gutterBottom
        textAlign="center"
        color="text.secondary"
        sx={{ mb: 4 }}
      >
        React, Next.js, and PostgreSQL Demo
      </Typography>

      <Box
        sx={{
          display: 'flex',
          gap: 4,
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}
      >
        <Card sx={{ width: 300 }}>
          <CardContent>
            <Typography variant="h5" component="div" gutterBottom>
              Numbers Page
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Submit integers and view adjacent number pairs with their sums.
            </Typography>
            <Button
              component={Link}
              href="/numbers"
              variant="contained"
              fullWidth
            >
              Go to Numbers
            </Button>
          </CardContent>
        </Card>

        <Card sx={{ width: 300 }}>
          <CardContent>
            <Typography variant="h5" component="div" gutterBottom>
              Grades Page
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Add and view grades for Math, Science, and History classes.
            </Typography>
            <Button
              component={Link}
              href="/grades"
              variant="contained"
              color="secondary"
              fullWidth
            >
              Go to Grades
            </Button>
          </CardContent>
        </Card>
      </Box>

      <Typography
        variant="body2"
        sx={{ mt: 8, textAlign: 'center', color: 'text.secondary' }}
      >
        This application demonstrates proficiency in React, Next.js, and raw SQL
        operations.
      </Typography>
    </Container>
  );
}
