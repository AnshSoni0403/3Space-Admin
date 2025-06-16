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

// Blog Card Component
const BlogCard = ({ blog, loading = false }) => {
  const theme = useTheme();
  
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
const BlogGrid = ({ blogs = [], loading = false }) => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        Our Blog
      </Typography>

      <Grid container spacing={4}>
        {loading ? (
          [...Array(3)].map((_, index) => (
            <Grid item key={index} xs={12} sm={6} md={4}>
              <BlogCard loading />
            </Grid>
          ))
        ) : (
          blogs.map((blog) => (
            <Grid item key={blog._id} xs={12} sm={6} md={4}>
              <BlogCard blog={blog} />
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
};

export { BlogCard, BlogDetail, BlogGrid };
