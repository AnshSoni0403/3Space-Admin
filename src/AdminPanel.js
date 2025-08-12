import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, Typography, Container, AppBar, Toolbar, IconButton, Drawer, List, ListItem, ListItemText, CssBaseline, Alert } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import InboxIcon from '@mui/icons-material/Inbox';
import ArticleIcon from '@mui/icons-material/Article';
import RefreshIcon from '@mui/icons-material/Refresh';
import Inquiries from './Inquiries';
import BlogManagementPage from './components/BlogManagementPage';
import BlogList from './components/BlogList';
import CareerManagement from './components/CareerManagement';
import ProductsManagement from './components/ProductsManagement';

// Mock database of users (in a real app, this would be in your backend)
const USERS = [
  { id: 1, username: 'admin', password: 'admin123', name: 'Administrator' },
  { id: 2, username: 'editor', password: 'editor123', name: 'Content Editor' },
  // Add more users as needed
];

// Session timeout in milliseconds (30 minutes)
const SESSION_TIMEOUT = 30 * 60 * 1000;

const drawerWidth = 240;

const AdminPanel = () => {
  // Check for active session on mount
  useEffect(() => {
    const checkSession = () => {
      const sessionData = sessionStorage.getItem('adminSession');
      if (sessionData) {
        const { username, timestamp } = JSON.parse(sessionData);
        const currentTime = new Date().getTime();
        
        // Check if session is expired
        if (currentTime - timestamp < SESSION_TIMEOUT) {
          // Session is valid
          const user = USERS.find(u => u.username === username);
          if (user) {
            setUsername(user.username);
            setIsLoggedIn(true);
            // Reset the session timestamp
            sessionStorage.setItem('adminSession', JSON.stringify({
              username: user.username,
              timestamp: currentTime
            }));
            return;
          }
        }
        // If we get here, session is invalid or user not found
        handleLogout();
      }
    };

    checkSession();

    // Set up session timeout check every minute
    const interval = setInterval(checkSession, 60000);
    
    // Clean up interval on unmount
    return () => clearInterval(interval);
  }, []);

  // Set up beforeunload event to clear session on tab close
  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.removeItem('adminSession');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
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
    // In a real application, this would be an API call to your backend
    const user = USERS.find(u => u.username === username && u.password === password);
    
    if (user) {
      setIsLoggedIn(true);
      // Save session to sessionStorage
      sessionStorage.setItem('adminSession', JSON.stringify({
        username: user.username,
        timestamp: new Date().getTime()
      }));
    } else {
      alert('Invalid credentials');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setPassword('');
    sessionStorage.removeItem('adminSession');
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
        {/* <ListItem button selected={selectedItem === 'blogs'} onClick={() => handleMenuItemClick('blogs')}>
          <ArticleIcon sx={{ mr: 2 }} />
          <ListItemText primary="Blogs" />
        </ListItem>
        <ListItem button selected={selectedItem === 'blog-list'} onClick={() => handleMenuItemClick('blog-list')}>
          <ArticleIcon sx={{ mr: 2 }} />
          <ListItemText primary="Blog List" />
        </ListItem> */}
        <ListItem button selected={selectedItem === 'careers'} onClick={() => handleMenuItemClick('careers')}>
          <ArticleIcon sx={{ mr: 2 }} />
          <ListItemText primary="Careers" />
        </ListItem>
        <ListItem button selected={selectedItem === 'products'} onClick={() => handleMenuItemClick('products')}>
          <ArticleIcon sx={{ mr: 2 }} />
          <ListItemText primary="Products" />
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
          {selectedItem === 'blogs' && <BlogManagementPage />}
          {selectedItem === 'blog-list' && <BlogList />}
          {selectedItem === 'careers' && <CareerManagement />}
          {selectedItem === 'products' && <ProductsManagement />}
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
        <Box component="form" sx={{ mt: 1, width: '100%' }}>
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
            sx={{ mb: 2 }}
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
            sx={{ mb: 3 }}
          />
          <Button
            type="button"
            fullWidth
            variant="contained"
            sx={{ mt: 1, mb: 2, py: 1.5 }}
            onClick={handleLogin}
            disabled={!username || !password}
          >
            Sign In
          </Button>
          <Typography variant="body2" color="textSecondary" align="center" sx={{ mt: 2 }}>
            Session will expire after 30 minutes of inactivity or when the tab is closed.
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default AdminPanel;