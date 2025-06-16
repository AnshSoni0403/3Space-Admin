import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Divider,
  Breadcrumbs,
  Link,
  Chip,
  useTheme,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { format, formatDistanceToNow } from 'date-fns';

const BlogDetail = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const navigate = useNavigate();

  const fetchBlog = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/blogs/${id}`);
      const data = await response.json();
      setBlog(data);
    } catch (error) {
      console.error('Error fetching blog:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlog();
  }, [id]);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Typography variant="h1" component="h1" gutterBottom>
            Loading...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (!blog) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h1" component="h1" gutterBottom>
          Blog not found
        </Typography>
      </Container>
    );
  }

  // Format date
  const formatDate = (date) => {
    return format(new Date(date), 'MMMM dd, yyyy');
  };

  // Format relative time
  const formatRelativeTime = (date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  // Calculate reading time
  const calculateReadingTime = (content) => {
    const words = content.split(' ').length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} min read`;
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" onClick={() => navigate('/blogs')}>
          All Blogs
        </Link>
        <Typography color="text.primary">{blog.title}</Typography>
      </Breadcrumbs>

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
            {/* Add image here if needed */}
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
            dangerouslySetInnerHTML={{ __html: blog.content }} // Note: Make sure to sanitize HTML content
          />
        </Box>
      </Paper>
    </Container>
  );
};

export default BlogDetail;
