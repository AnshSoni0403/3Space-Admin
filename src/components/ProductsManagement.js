import React, { useState, useEffect } from 'react';
import {
  Box, Button, Card, CardContent, TextField, Typography, Grid, CardMedia,
  FormControlLabel, Checkbox, Chip, Alert, CircularProgress, Paper, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton
} from '@mui/material';
import { CloudUpload, Delete, Edit } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const ProductsManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingId, setEditingId] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    oldPrice: '',
    isNew: false,
    tags: '',
    image: null,
    imagePreview: ''
  });

  // Use mock server URL in development
  const API_URL = 'http://localhost:5000/api/products';

  // Helper function to parse response as JSON or text
  const parseResponse = async (response) => {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    const text = await response.text();
    console.error('Non-JSON response:', text);
    throw new Error('Received non-JSON response from server');
  };

  // Fetch products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      const data = await parseResponse(response);
      
      if (!response.ok) {
        throw new Error(data.message || `Error: ${response.status} - ${response.statusText}`);
      }
      
      setProducts(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      console.error('Fetch products error:', err);
      setError(`Failed to load products: ${err.message}. Please check if the backend server is running.`);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'file') {
      const file = files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData(prev => ({
            ...prev,
            image: file,
            imagePreview: reader.result
          }));
        };
        reader.readAsDataURL(file);
      }
    } else if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('oldPrice', formData.oldPrice || '');
      formDataToSend.append('isNew', formData.isNew);
      formDataToSend.append('tags', formData.tags);
      
      // Only append image if it's a new file (not the existing image URL)
      if (formData.image && typeof formData.image !== 'string') {
        formDataToSend.append('image', formData.image);
      }

      const url = editingId ? `${API_URL}/${editingId}` : API_URL;
      const method = editingId ? 'PUT' : 'POST';
      
      console.log(`Sending ${method} request to:`, url);
      
      const response = await fetch(url, {
        method,
        body: formDataToSend,
        // Don't set Content-Type header - let the browser set it with the correct boundary
      });

      console.log('Response status:', response.status);
      
      let result;
      try {
        result = await parseResponse(response);
        console.log('Response data:', result);
      } catch (err) {
        console.error('Error parsing response:', err);
        const errorText = await response.text().catch(() => 'No response text');
        console.error('Raw response:', errorText);
        throw new Error('Invalid response from server');
      }

      if (!response.ok) {
        throw new Error(result.message || `Error: ${response.status} - ${response.statusText}`);
      }
      
      setSuccess(editingId ? 'Product updated successfully!' : 'Product added successfully!');
      
      // Reset form and refresh products
      resetForm();
      fetchProducts();
    } catch (err) {
      console.error('Submit error:', err);
      setError(err.message || 'Error saving product');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingId(product._id);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      oldPrice: product.oldPrice || '',
      isNew: product.isNew || false,
      tags: product.tags ? product.tags.join(', ') : '',
      image: product.imagePath || null, // Store the existing image path
      imagePreview: product.imagePath ? `http://localhost:5000/${product.imagePath}` : ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await fetch(`${API_URL}/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) throw new Error('Failed to delete product');
        
        setSuccess('Product deleted successfully!');
        fetchProducts();
      } catch (err) {
        setError(err.message || 'Error deleting product');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      oldPrice: '',
      isNew: false,
      tags: '',
      image: null,
      imagePreview: ''
    });
    setEditingId(null);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const testConnection = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      const result = await response.text();
      console.log('Raw response:', result);
      
      if (response.ok) {
        alert(`Connection successful! Response: ${result.substring(0, 100)}...`);
      } else {
        alert(`Connection failed (${response.status}): ${result}`);
      }
    } catch (err) {
      console.error('Connection test error:', err);
      alert(`Connection error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          {editingId ? 'Edit Product' : 'Add New Product'}
        </Typography>
        <Button 
          variant="outlined" 
          onClick={testConnection}
          disabled={loading}
          size="small"
        >
          Test Connection
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Product Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  margin="normal"
                />
                
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  multiline
                  rows={4}
                  margin="normal"
                />

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Price (INR)"
                      name="price"
                      type="number"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      margin="normal"
                      InputProps={{
                        startAdornment: '₹',
                      }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Old Price (Optional)"
                      name="oldPrice"
                      type="number"
                      value={formData.oldPrice}
                      onChange={handleInputChange}
                      margin="normal"
                      InputProps={{
                        startAdornment: '₹',
                      }}
                    />
                  </Grid>
                </Grid>

                <TextField
                  fullWidth
                  label="Tags (comma separated)"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  margin="normal"
                  placeholder="e.g., electronics, gadgets, new-arrival"
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.isNew}
                      onChange={handleInputChange}
                      name="isNew"
                      color="primary"
                    />
                  }
                  label="Mark as New Arrival"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 2 }}>
                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={<CloudUpload />}
                    fullWidth
                    sx={{ mb: 1, height: 150, borderStyle: 'dashed' }}
                  >
                    {formData.imagePreview ? 'Change Image' : 'Upload Product Image'}
                    <VisuallyHiddenInput 
                      type="file" 
                      accept="image/*"
                      onChange={handleInputChange}
                      name="image"
                    />
                  </Button>
                  {formData.imagePreview && (
                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                      <img 
                        src={formData.imagePreview} 
                        alt="Preview" 
                        style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }} 
                      />
                    </Box>
                  )}
                </Box>
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
                disabled={loading}
              >
                {loading ? 'Saving...' : editingId ? 'Update Product' : 'Add Product'}
              </Button>
              {editingId && (
                <Button 
                  variant="outlined" 
                  onClick={resetForm}
                  disabled={loading}
                >
                  Cancel
                </Button>
              )}
            </Box>
          </form>
        </CardContent>
      </Card>

      <Typography variant="h5" gutterBottom>Product List</Typography>
      
      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : products.length === 0 ? (
        <Paper elevation={0} sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="textSecondary">No products found. Add your first product!</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Image</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="right">Price</TableCell>
                <TableCell>Tags</TableCell>
                <TableCell align="center">New</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product._id}>
                  <TableCell>
                    {product.imagePath && (
                      <img 
                        src={`https://spaceadmin-3qo5.onrender.com/${product.imagePath}`} 
                        alt={product.name}
                        style={{ width: 50, height: 50, objectFit: 'cover' }}
                      />
                    )}
                  </TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell sx={{ 
                    maxWidth: 300, 
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {product.description}
                  </TableCell>
                  <TableCell align="right">
                    <Box>
                      <Box sx={{ textDecoration: product.oldPrice ? 'line-through' : 'none' }}>
                        {formatPrice(product.price)}
                      </Box>
                      {product.oldPrice > product.price && (
                        <Box sx={{ color: 'error.main', fontWeight: 'bold' }}>
                          {formatPrice(product.oldPrice)}
                        </Box>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, maxWidth: 200 }}>
                      {product.tags && product.tags.map((tag, index) => (
                        <Chip key={index} label={tag} size="small" />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    {product.isNew ? '✅' : '❌'}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton 
                      color="primary" 
                      onClick={() => handleEdit(product)}
                      size="small"
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton 
                      color="error" 
                      onClick={() => handleDelete(product._id)}
                      size="small"
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default ProductsManagement;
