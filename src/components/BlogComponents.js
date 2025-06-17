import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  CardHeader,
  Divider,
  Chip,
  Skeleton,
  useTheme,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
} from '@mui/material';
import { format, formatDistanceToNow } from 'date-fns';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

// Blog Card Component
const BlogCard = ({ blog, loading = false, onEdit, onDelete }) => {
  const theme = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: blog.title,
    subtitle: blog.subtitle,
    content: blog.content,
    author: blog.author,
  });

  if (loading) {
    return (
      <Paper sx={{ p: 2, height: '100%' }}>
        <Skeleton variant="rectangular" height={200} />
        <Skeleton variant="text" height={60} width="80%" />
        <Skeleton variant="text" height={20} width="60%" />
        <Skeleton variant="text" height={20} width="40%" />
      </Paper>
    );
  }

  const formatDate = (date) => format(new Date(date), 'MMMM dd, yyyy');
  const formatRelativeTime = (date) => formatDistanceToNow(new Date(date), { addSuffix: true });
  const calculateReadingTime = (content) => {
    const words = content.split(' ').length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} min read`;
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'scale(1.02)',
        },
      }}
    >
      {isEditing ? (
        <CardContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Edit Blog
            </Typography>
            <TextField
              fullWidth
              label="Title"
              value={editData.title}
              onChange={(e) => setEditData({ ...editData, title: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Subtitle"
              value={editData.subtitle}
              onChange={(e) => setEditData({ ...editData, subtitle: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Author"
              value={editData.author}
              onChange={(e) => setEditData({ ...editData, author: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Content"
              multiline
              rows={4}
              value={editData.content}
              onChange={(e) => setEditData({ ...editData, content: e.target.value })}
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={() => {
                  onEdit(blog._id, editData);
                  setIsEditing(false);
                }}
              >
                Save
              </Button>
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        </CardContent>
      ) : (
        <>
          <CardActionArea>
            <CardMedia
              component="img"
              height="200"
              image={`http://localhost:5000/api/blogs/${blog._id}/image`}
              alt={blog.title}
            />
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography gutterBottom variant="h5" component="h2">
                {blog.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {blog.subtitle}
              </Typography>
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  {formatDate(blog.createdAt)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatRelativeTime(blog.createdAt)}
                </Typography>
                <Chip
                  label={calculateReadingTime(blog.content)}
                  size="small"
                  color="primary"
                />
                <Typography variant="body2" color="text.secondary">
                  by {blog.author}
                </Typography>
              </Box>
            </CardContent>
          </CardActionArea>
          <CardHeader
            action={
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton onClick={() => setIsEditing(true)}>
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => onDelete(blog._id)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            }
            title=""
          />
        </>
      )}
    </Card>
  );
};

// Blog Detail Component
const BlogDetail = ({ blog, loading = false }) => {
  const theme = useTheme();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <Typography variant="h1" component="h1" gutterBottom>
          Loading...
        </Typography>
      </Box>
    );
  }

  if (!blog) {
    return (
      <Typography variant="h1" component="h1" gutterBottom>
        Blog not found
      </Typography>
    );
  }

  const formatDate = (date) => format(new Date(date), 'MMMM dd, yyyy');
  const formatRelativeTime = (date) => formatDistanceToNow(new Date(date), { addSuffix: true });
  const calculateReadingTime = (content) => {
    const words = content.split(' ').length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} min read`;
  };

  return (
    <Paper sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h1" component="h1" gutterBottom>
          {blog.title}
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          {blog.subtitle}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
          <Typography variant="body2" color="text.secondary">
            {formatDate(blog.createdAt)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {formatRelativeTime(blog.createdAt)}
          </Typography>
          <Chip
            label={calculateReadingTime(blog.content)}
            size="small"
            color="primary"
          />
          <Typography variant="body2" color="text.secondary">
            by {blog.author}
          </Typography>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mb: 4 }}>
          <CardMedia
            component="img"
            height="400"
            image={`http://localhost:5000/api/blogs/${blog._id}/image`}
            alt={blog.title}
          />
        </Box>

        <Box
          sx={{
            '& p': {
              mb: 2,
            },
            '& ul': {
              mb: 2,
            },
            '& li': {
              mb: 1,
            },
          }}
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />
      </Box>
    </Paper>
  );
};

// Main Blog Grid Component
const BlogGrid = ({ blogs = [], loading = false, onEdit, onDelete }) => {
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteBlogId, setDeleteBlogId] = useState(null);

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/blogs/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        onDelete(id);
        setOpenDeleteDialog(false);
      }
    } catch (error) {
      console.error('Error deleting blog:', error);
    }
  };

  const handleEdit = async (id, data) => {
    try {
      const response = await fetch(`http://localhost:5000/api/blogs/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        onEdit(id, data);
      }
    } catch (error) {
      console.error('Error editing blog:', error);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        Our Blog
      </Typography>

      <Grid container spacing={4}>
        {loading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <BlogCard loading />
            </Grid>
          ))
        ) : (
          blogs.map((blog) => (
            <Grid item xs={12} sm={6} md={4} key={blog._id}>
              <BlogCard
                blog={blog}
                onEdit={handleEdit}
                onDelete={() => {
                  setDeleteBlogId(blog._id);
                  setOpenDeleteDialog(true);
                }}
              />
            </Grid>
          ))
        )}
      </Grid>

      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Delete Blog</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this blog? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button
            onClick={() => handleDelete(deleteBlogId)}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <Button variant="contained" color="primary">
          Load More
        </Button>
      </Box>
    </Container>
  );
};

export { BlogCard, BlogDetail, BlogGrid };
