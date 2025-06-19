'use client';

import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Link from 'next/link';
import { NoSsr } from '@mui/material';

export default function Navbar() {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <NoSsr>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Full Stack Homework
            </Typography>
            <Button color="inherit" component={Link} href="/numbers">
              Numbers
            </Button>
            <Button color="inherit" component={Link} href="/grades">
              Grades
            </Button>
          </Toolbar>
        </AppBar>
      </NoSsr>
    </Box>
  );
}
