import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material';

const BlogManagement = () => {
  const [blogs, setBlogs] = useState([]);
  const [newBlog, setNewBlog] = useState({
    title: '',
    subtitle: '',
    content: '',
    author: '',
    readingTime: '',
    createdAt: new Date().toISOString(),
  });
  const [editingBlog, setEditingBlog] = useState(null);

  // Fetch blogs from backend
  const fetchBlogs = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/blogs');
      const data = await response.json();
      setBlogs(data);
    } catch (error) {
      console.error('Error fetching blogs:', error);
    }
  };

  // Add new blog
  const handleAddBlog = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/blogs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newBlog),
      });
      
      if (response.ok) {
        setNewBlog({ title: '', content: '', author: '', category: '' });
        fetchBlogs();
      }
    } catch (error) {
      console.error('Error adding blog:', error);
    }
  };

  // Update blog
  const handleUpdateBlog = async (id, updatedBlog) => {
    try {
      const response = await fetch(`http://localhost:5000/api/blogs/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedBlog),
      });
      
      if (response.ok) {
        setEditingBlog(null);
        fetchBlogs();
      }
    } catch (error) {
      console.error('Error updating blog:', error);
    }
  };

  // Delete blog
  const handleDeleteBlog = async (id) => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/blogs/${id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          fetchBlogs();
        }
      } catch (error) {
        console.error('Error deleting blog:', error);
      }
    }
  };

  // Handle form changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewBlog(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle edit
  const handleEdit = (blog) => {
    setEditingBlog(blog);
    setNewBlog({
      title: blog.title,
      content: blog.content,
      author: blog.author,
      category: blog.category,
    });
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingBlog(null);
    setNewBlog({ title: '', content: '', author: '', category: '' });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography component="h1" variant="h4" align="center" color="primary" gutterBottom>
        Blog Management
      </Typography>

      <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
        {/* Blog Form */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label="Title"
            name="title"
            value={newBlog.title}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Subtitle"
            name="subtitle"
            value={newBlog.subtitle}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Content"
            name="content"
            multiline
            rows={4}
            value={newBlog.content}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Author"
            name="author"
            value={newBlog.author}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Estimated Reading Time (minutes)"
            name="readingTime"
            type="number"
            value={newBlog.readingTime}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
            helperText="Enter the estimated reading time in minutes"
          />

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={editingBlog ? () => handleUpdateBlog(editingBlog._id, newBlog) : handleAddBlog}
              sx={{ mr: 1 }}
            >
              {editingBlog ? 'Update' : 'Add'} Blog
            </Button>
            {editingBlog && (
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleCancelEdit}
              >
                Cancel
              </Button>
            )}
          </Box>
        </Box>

        {/* Blog List */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Author</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {blogs.map((blog) => (
                <TableRow key={blog._id}>
                  <TableCell>{blog.title}</TableCell>
                  <TableCell>{blog.author}</TableCell>
                  <TableCell>{blog.category}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEdit(blog)} color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteBlog(blog._id)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
};

export default BlogManagement;
