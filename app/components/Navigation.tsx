'use client';

import MenuIcon from '@mui/icons-material/Menu';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import {
  Alert,
  AppBar,
  Box,
  Button,
  Container,
  IconButton,
  Menu,
  MenuItem,
  NoSsr,
  Snackbar,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useThemeContext } from '../context/ThemeContext';
import { QUERY_KEYS, ROUTES } from '../common/consts';

export default function Navigation() {
  const pathname = usePathname();
  const theme = useTheme();
  const { darkMode, toggleDarkMode } = useThemeContext();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const { isError } = useQuery({
    queryKey: [QUERY_KEYS.INIT],
    queryFn: async () => {
      const response = await fetch(ROUTES.INIT);
      if (!response.ok) {
        throw new Error('Failed to initialize tables');
      }
      return response.json();
    },
  });

  const navItems = [
    { path: '/numbers', label: 'Numbers' },
    { path: '/grades', label: 'Grades' },
  ];

  return (
    <AppBar position="static" color="primary" sx={{ mb: 4 }} elevation={0}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, display: 'flex', cursor: 'pointer' }}
            onClick={() => (window.location.href = '/')}
            noWrap
          >
            Full Stack Assessment
          </Typography>

          {/* Dark mode toggle button */}
          <Tooltip
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <IconButton
              color="inherit"
              onClick={toggleDarkMode}
              edge={isMobile ? false : 'end'}
              size="large"
              sx={{ mr: isMobile ? 1 : 0 }}
              aria-label="toggle dark mode"
            >
              {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>

          {isMobile ? (
            <>
              <IconButton
                size="large"
                edge="end"
                color="inherit"
                aria-label="menu"
                onClick={handleMenu}
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={open}
                onClose={handleClose}
              >
                {navItems.map((item) => (
                  <MenuItem
                    key={item.path}
                    component={Link}
                    href={item.path}
                    onClick={handleClose}
                    selected={pathname === item.path}
                  >
                    {item.label}
                  </MenuItem>
                ))}
              </Menu>
            </>
          ) : (
            <Box sx={{ display: 'flex', gap: 2 }}>
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  component={Link}
                  href={item.path}
                  color="inherit"
                  variant={pathname === item.path ? 'outlined' : 'text'}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          )}
        </Toolbar>
      </Container>

      <Snackbar
        open={isError}
        autoHideDuration={3000}
        onClose={() => {}}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error">
          Failed to initialize tables. Please check the server logs.
        </Alert>
      </Snackbar>
    </AppBar>
  );
}
