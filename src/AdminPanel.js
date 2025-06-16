import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, Typography, Container, AppBar, Toolbar, IconButton, Drawer, List, ListItem, ListItemText, CssBaseline } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import InboxIcon from '@mui/icons-material/Inbox';
import ArticleIcon from '@mui/icons-material/Article';
import RefreshIcon from '@mui/icons-material/Refresh';
import Inquiries from './Inquiries';
import BlogManagement from './BlogManagement'; // Import the BlogManagement component

const drawerWidth = 240;

const AdminPanel = () => {
  // Check if user is logged in from localStorage
  useEffect(() => {
    const savedLogin = localStorage.getItem('adminLogin');
    if (savedLogin) {
      const { username, password } = JSON.parse(savedLogin);
      setUsername(username);
      setPassword(password);
      setIsLoggedIn(true);
    }
  }, []);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState('inquiries'); // State to manage selected sidebar item

  // Fetch blogs when component mounts
  useEffect(() => {
    if (isLoggedIn) {
      const fetchBlogs = async () => {
        try {
          const response = await fetch('http://localhost:5000/api/blogs');
          const data = await response.json();
          // You might want to store this in a context or redux store for global access
          console.log('Fetched blogs:', data);
        } catch (error) {
          console.error('Error fetching blogs:', error);
        }
      };
      fetchBlogs();
    }
  }, [isLoggedIn]);

  const handleLogin = () => {
    // In a real application, you would send these credentials to a backend for authentication.
    // For this example, we'll use a simple hardcoded check.
    if (username === 'admin' && password === 'admin123') {
      setIsLoggedIn(true);
      // Save login state to localStorage
      localStorage.setItem('adminLogin', JSON.stringify({ username, password }));
    } else {
      alert('Invalid credentials');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setPassword('');
    localStorage.removeItem('adminLogin');
  };

  const handleContentRefresh = () => {
    if (selectedItem === 'inquiries') {
      // Force re-render of Inquiries component
      setSelectedItem('');
      setTimeout(() => setSelectedItem('inquiries'), 100);
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuItemClick = (item) => {
    setSelectedItem(item);
    setMobileOpen(false); // Close drawer on mobile after selection
  };

  const drawer = (
    <div>
      <Toolbar />
      <List>
        <ListItem button selected={selectedItem === 'inquiries'} onClick={() => handleMenuItemClick('inquiries')}>
          <InboxIcon sx={{ mr: 2 }} />
          <ListItemText primary="Inquiries" />
        </ListItem>
        <ListItem button selected={selectedItem === 'blogs'} onClick={() => handleMenuItemClick('blogs')}>
          <ArticleIcon sx={{ mr: 2 }} />
          <ListItemText primary="Blogs" />
        </ListItem>
      </List>
    </div>
  );

  if (isLoggedIn) {
    return (
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div">
              Admin Dashboard
            </Typography>
            <Box sx={{ flexGrow: 1 }} />
            <IconButton
              color="inherit"
              onClick={handleContentRefresh}
              sx={{ mr: 2 }}
            >
              <RefreshIcon />
            </IconButton>
            <Button
              color="inherit"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Toolbar>
        </AppBar>
        <Box
          component="nav"
          sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
          aria-label="mailbox folders"
        >
          {/* The implementation can be swapped with js to avoid SEO duplication of the drawer. */}
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
            sx={{
              display: { xs: 'block', sm: 'none' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            }}
          >
            {drawer}
          </Drawer>
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', sm: 'block' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            }}
            open
          >
            {drawer}
          </Drawer>
        </Box>
        <Box
          component="main"
          sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
        >
          <Toolbar />
          {selectedItem === 'inquiries' && <Inquiries />}
          {selectedItem === 'blogs' && <BlogManagement />}
          {/* Other sections can be added here based on selectedItem */}
        </Box>
      </Box>
    );
  }

  return (
    <Container component="main" maxWidth="xs" sx={{ mt: 8 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          p: 4,
          boxShadow: 3,
          borderRadius: 2,
        }}
      >
        <Typography component="h1" variant="h5">
          Admin Login
        </Typography>
        <Box component="form" noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username"
            name="username"
            autoComplete="username"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            onClick={handleLogin}
          >
            Sign In
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default AdminPanel; 