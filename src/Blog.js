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
  Divider,
  Chip,
  Skeleton,
  useTheme,
} from '@mui/material';
import { format, formatDistanceToNow } from 'date-fns';

const Blog = () => {
  const [blogs, setBlogs] = useState([]);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  // Helper functions
  const calculateReadingTime = (content) => {
    const words = content.split(' ').length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} min read`;
  };

  const formatDate = (date) => format(new Date(date), 'MMMM dd, yyyy');

  const formatRelativeTime = (date) => formatDistanceToNow(new Date(date), { addSuffix: true });

  // Fetch blogs from backend
  const fetchBlogs = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/blogs');
      const data = await response.json();
      // Calculate fallback reading time for blogs without specified time
      data.forEach((blog) => {
        if (!blog.readingTime) {
          const words = blog.content.split(' ').length;
          blog.readingTime = `${Math.ceil(words / 200)} min read`;
        }
      });
      setBlogs(data);
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch blogs when component mounts
  useEffect(() => {
    fetchBlogs();
  }, []);
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  // Calculate reading time
  const calculateReadingTime = (content) => {
    const words = content.split(' ').length;
    const minutes = Math.ceil(words / 200); // Assuming 200 words per minute
    return `${minutes} min read`;
  };

  // Format date
  const formatDate = (date) => {
    return format(new Date(date), 'MMMM dd, yyyy');
  };
  const formatRelativeTime = (date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  // Render blog list
  const renderBlogList = () => (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        Our Blog
      </Typography>

      <Grid container spacing={4}>
        {loading ? (
          // Loading skeletons
          [...Array(3)].map((_, index) => (
            <Grid item key={index} xs={12} sm={6} md={4}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Skeleton variant="rectangular" height={200} />
                <Skeleton variant="text" height={60} width="80%" />
                <Skeleton variant="text" height={20} width="60%" />
                <Skeleton variant="text" height={20} width="40%" />
              </Paper>
            </Grid>
          ))
        ) : (
          blogs.map((blog) => (
            <Grid item key={blog._id} xs={12} sm={6} md={4}>
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
                onClick={() => setSelectedBlog(blog)}
              >
                <CardActionArea>
                  {/* Placeholder for blog content */}
                  <Box sx={{ height: 200, bgcolor: 'grey.200', borderRadius: 1 }} />
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
                        label={blog.readingTime || calculateReadingTime(blog.content)}
                        size="small"
                        color="primary"
                      />
                      <Typography variant="body2" color="text.secondary">
                        by {blog.author}
                      </Typography>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <Button variant="contained" color="primary">
          Load More
        </Button>
      </Box>
    </Container>
  );

  // Render blog detail
  const renderBlogDetail = () => (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Button
        variant="outlined"
        onClick={() => setSelectedBlog(null)}
        sx={{ mb: 2 }}
      >
        Back to Blog List
      </Button>

      <Paper sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="h1" component="h1" gutterBottom>
            {selectedBlog.title}
          </Typography>
          <Typography variant="h6" color="text.secondary" paragraph>
            {selectedBlog.subtitle}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
            <Typography variant="body2" color="text.secondary">
              {formatDate(selectedBlog.createdAt)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {formatRelativeTime(selectedBlog.createdAt)}
            </Typography>
            <Chip
              label={selectedBlog.readingTime || calculateReadingTime(selectedBlog.content)}
              size="small"
              color="primary"
            />
            <Typography variant="body2" color="text.secondary">
              by {selectedBlog.author}
            </Typography>
          </Box>

          <Divider sx={{ my: 4 }} />

          <Box sx={{ mb: 4 }}>
            {/* Placeholder for blog detail content */}
            <Box sx={{ height: 400, bgcolor: 'grey.200', borderRadius: 1 }} />
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
            dangerouslySetInnerHTML={{ __html: selectedBlog.content }}
          />
        </Box>
      </Paper>
    </Container>
  );

  // Fetch blogs when component mounts
  useEffect(() => {
    fetchBlogs();
  }, []);

  return selectedBlog ? renderBlogDetail() : renderBlogList();

export default Blog;
