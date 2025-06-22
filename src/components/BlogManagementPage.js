import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { BlogCard } from './BlogComponents';

/**
 * BlogManagementPage – Admin interface for managing blog posts.
 *
 * Features:
 * 1. Display all existing blogs using `BlogCard` from BlogComponents.
 * 2. Add new blog posts with a dialog form.
 * 3. Edit & delete existing blogs.
 * 4. Instant feedback via Snackbar notifications.
 */

const BlogManagementPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [openDialog, setOpenDialog] = useState(false);
  const [currentBlog, setCurrentBlog] = useState(null); // null -> create mode, object -> edit mode

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    content: '',
    author: '',
    readingTime: '',
    excerpt: '',
    date: '',
    category: '',
    image: '',
  });

  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // Fetch blogs on mount
  useEffect(() => {
    fetchBlogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/blogs');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setBlogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching blogs:', err);
      setError(err.message);
      showSnackbar('Failed to fetch blogs', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Snackbar helpers
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };
  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  // Dialog handlers
  const handleOpenDialog = (blog = null) => {
    setCurrentBlog(blog);
    if (blog) {
      setFormData({
        title: blog.title,
        subtitle: blog.subtitle || '',
        content: blog.content,
        author: blog.author,
        readingTime: blog.readingTime || '',
        excerpt: blog.excerpt || '',
        date: blog.date || '',
        category: blog.category || '',
        image: blog.image || '',
      });
    } else {
      setFormData({ title: '', subtitle: '', content: '', author: '',
        readingTime: '',
        excerpt: '',
        date: '',
        category: '',
        image: '', });
    }
    setOpenDialog(true);
  };
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentBlog(null);
  };

  // Form change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // File input handler
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    // Store filename so it can be saved/displayed
    setFormData(prev => ({ ...prev, image: file.name }));
  };

  // Create or update submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = currentBlog ? 'PUT' : 'POST';
      const url = currentBlog
        ? `http://localhost:5000/api/blogs/${currentBlog._id}`
        : 'http://localhost:5000/api/blogs';

      const fd = new FormData();
      Object.entries(formData).forEach(([k, v]) => fd.append(k, v));
      if (imageFile) {
        fd.append('image', imageFile);
      }
      const fetchOptions = { method, body: fd };

      const response = await fetch(url, fetchOptions);

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      showSnackbar(currentBlog ? 'Blog updated successfully' : 'Blog added successfully');
      handleCloseDialog();
      fetchBlogs();
    } catch (err) {
      console.error('Error saving blog:', err);
      showSnackbar('Failed to save blog', 'error');
    }
  };

  // Delete blog
  const handleDelete = async (blogId) => {
    if (!window.confirm('Are you sure you want to delete this blog?')) return;
    try {
      const response = await fetch(`http://localhost:5000/api/blogs/${blogId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      showSnackbar('Blog deleted');
      fetchBlogs();
    } catch (err) {
      console.error('Error deleting blog:', err);
      showSnackbar('Failed to delete blog', 'error');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" color="primary">
          Blog Management
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
          Add Blog
        </Button>
      </Box>

      {/* Blog list */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : blogs.length === 0 ? (
        <Typography>No blogs found.</Typography>
      ) : (
        <Grid container spacing={4}>
          {blogs.map((blog) => (
            <Grid item xs={12} sm={6} md={4} key={blog._id}>
              <BlogCard
                blog={blog}
                onEdit={() => handleOpenDialog(blog)}
                onDelete={() => handleDelete(blog._id)}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{currentBlog ? 'Edit Blog' : 'Add Blog'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent dividers>
            <TextField
              fullWidth
              label="Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Subtitle"
              name="subtitle"
              value={formData.subtitle}
              onChange={handleChange}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Excerpt / Summary"
              name="excerpt"
              value={formData.excerpt}
              onChange={handleChange}
              multiline
              rows={3}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Author"
              name="author"
              value={formData.author}
              onChange={handleChange}
              required
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth required sx={{ mb: 2 }}>
              <InputLabel id="category-label">Category</InputLabel>
              <Select
                labelId="category-label"
                name="category"
                value={formData.category}
                label="Category"
                onChange={handleChange}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="technology">Technology</MenuItem>
                <MenuItem value="industry">Industry</MenuItem>
                <MenuItem value="business">Business</MenuItem>
                <MenuItem value="sustainability">Sustainability</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Estimated Reading Time (minutes)"
              name="readingTime"
              type="number"
              value={formData.readingTime}
              onChange={handleChange}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Publish Date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              required
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />

            <Button variant="contained" component="label" sx={{ mb: 2 }}>
              Upload Image
              <input type="file" hidden accept="image/*" onChange={handleFileChange} />
            </Button>
            {imageFile && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Selected: {imageFile.name}
                </Typography>
                {previewUrl && (
                  <Box
                    component="img"
                    src={previewUrl}
                    alt="Preview"
                    sx={{ width: '100%', maxHeight: 200, objectFit: 'contain', borderRadius: 1 }}
                  />
                )}
              </Box>
            )}
            <TextField
              fullWidth
              label="Content"
              name="content"
              multiline
              rows={6}
              value={formData.content}
              onChange={handleChange}
              required
            />
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center', p: 2 }}>
            <Button onClick={handleCloseDialog} variant="outlined" sx={{ mr: 2 }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={!formData.title || !formData.content || !formData.author || !formData.readingTime || !formData.excerpt || !formData.date || !formData.category || (!imageFile && !formData.image)}
            >
              {currentBlog ? 'Update Blog' : 'Add Blog'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default BlogManagementPage;
