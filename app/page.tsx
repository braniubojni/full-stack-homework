import { Container, Typography } from '@mui/material';

export default function Home() {
  return (
    <Container>
      <Typography variant="h4" component="h1" sx={{ mt: 2, mb: 2 }}>
        Home
      </Typography>
      <Typography variant="body1">
        Welcome to the Full Stack Homework application.
      </Typography>
      <Typography variant="body1">
        Use the navigation bar to go to the Numbers or Grades page.
      </Typography>
    </Container>
  );
}
