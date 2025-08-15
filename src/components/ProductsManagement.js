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

  // Production backend URL
  const API_URL = 'https://threespacebackend.onrender.com/api/products';

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
      // Log form data for debugging (without the actual file object)
      const formDataLog = {
        ...formData,
        image: formData.image ? (typeof formData.image === 'string' ? 'Existing image' : 'New file selected') : 'No file',
        price: formData.price,
        oldPrice: formData.oldPrice || '',
        isNew: formData.isNew,
        tags: formData.tags
      };
      console.log('Form data being submitted:', formDataLog);

      // Create form data with validation
      const formDataToSend = new FormData();
      
      // Validate required fields
      if (!formData.name || !formData.description || !formData.price) {
        throw new Error('Please fill in all required fields: Name, Description, and Price');
      }
      
      // Add fields with validation
      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('description', formData.description.trim());
      
      // Validate price is a number
      const price = parseFloat(formData.price);
      if (isNaN(price)) {
        throw new Error('Price must be a valid number');
      }
      formDataToSend.append('price', price);
      
      // Add optional fields if they exist
      if (formData.oldPrice) {
        const oldPrice = parseFloat(formData.oldPrice);
        if (!isNaN(oldPrice)) {
          formDataToSend.append('oldPrice', oldPrice);
        }
      }
      
      formDataToSend.append('isNew', formData.isNew ? 'true' : 'false');
      
      // Handle tags - convert string to array if needed
      if (formData.tags) {
        const tags = Array.isArray(formData.tags) 
          ? formData.tags 
          : formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
        formDataToSend.append('tags', JSON.stringify(tags));
      }
      
      // Handle image upload
      if (formData.image && typeof formData.image !== 'string') {
        console.log('Appending image file to form data');
        // Validate image size (e.g., 5MB max)
        if (formData.image.size > 5 * 1024 * 1024) {
          throw new Error('Image size should be less than 5MB');
        }
        formDataToSend.append('image', formData.image);
      } else if (formData.image) {
        console.log('Using existing image path:', formData.image);
      }

      const url = editingId ? `${API_URL}/${editingId}` : API_URL;
      const method = editingId ? 'PUT' : 'POST';
      
      // Log request details (without the actual file content)
      const requestDetails = {
        method,
        url,
        headers: {
          'Accept': 'application/json',
        },
        body: {
          name: formData.name,
          description: formData.description,
          price: formData.price,
          oldPrice: formData.oldPrice,
          isNew: formData.isNew,
          tags: formData.tags,
          hasImage: !!(formData.image)
        }
      };
      
      console.log('Sending request:', requestDetails);
      
      // For debugging, log the actual form data keys
      console.log('FormData keys:');
      for (let pair of formDataToSend.entries()) {
        console.log(pair[0], pair[1]);
      }
      
      try {
        const startTime = Date.now();
        const response = await fetch(url, {
          method,
          body: formDataToSend,
          // Let the browser set the Content-Type with the correct boundary
        });
        const endTime = Date.now();
        
        console.log(`Request completed in ${endTime - startTime}ms`);
        console.log('Response status:', response.status, response.statusText);
        
        // Always get the response text first
        const responseText = await response.text();
        console.log('Raw response text:', responseText);
        
        let result = {};
        try {
          // Try to parse as JSON, but handle non-JSON responses
          if (responseText && responseText.trim()) {
            // Special handling for non-JSON responses
            if (responseText.trim() === 'Something broke!') {
              console.error('Server returned generic error:', responseText);
              throw new Error('The server encountered an unexpected error. Our team has been notified.');
            }
            result = JSON.parse(responseText);
          }
          console.log('Parsed response data:', result);
        } catch (parseError) {
          console.error('Error parsing JSON response:', parseError);
          // If we get a server error with non-JSON response, include the status code in the error
          if (response.status >= 500) {
            // Log the full error details for debugging
            console.error('Server error details:', {
              status: response.status,
              statusText: response.statusText,
              headers: Object.fromEntries(response.headers.entries()),
              responseText
            });
            
            // Provide a more user-friendly error message
            if (responseText.includes('Something broke!')) {
              throw new Error('The server encountered an unexpected error. Our team has been notified.');
            } else {
              throw new Error(`Server error (${response.status}): Please try again later or contact support.`);
            }
          } else {
            throw new Error(`Invalid server response. Please try again.`);
          }
        }

        if (!response.ok) {
          const errorMessage = result.message || 
                             result.error || 
                             result.details ||
                             `Server error: ${response.status} ${response.statusText}`;
          throw new Error(errorMessage);
        }
        
        const successMessage = editingId ? 'Product updated successfully!' : 'Product added successfully!';
        console.log(successMessage);
        setSuccess(successMessage);
        
        // Reset form and refresh products
        resetForm();
        fetchProducts();
      } catch (fetchError) {
        console.error('Fetch error details:', {
          name: fetchError.name,
          message: fetchError.message,
          stack: fetchError.stack,
          code: fetchError.code,
          status: fetchError.status
        });
        throw fetchError;
      }
    } catch (err) {
      console.error('Submit error details:', {
        name: err.name,
        message: err.message,
        stack: err.stack,
        code: err.code,
        status: err.status
      });
      
      // More user-friendly error messages
      let userErrorMessage = 'Error saving product. ';
      if (err.message.includes('Failed to fetch')) {
        userErrorMessage += 'Unable to connect to the server. Please check your internet connection.';
      } else if (err.message.includes('500')) {
        userErrorMessage += 'Server error. Please try again later or contact support if the problem persists.';
      } else {
        userErrorMessage += err.message || 'Please check the console for details.';
      }
      
      setError(userErrorMessage);
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
      imagePreview: product.imagePath ? `https://threespacebackend.onrender.com/${product.imagePath}` : ''
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.9 }}>
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
                        src={`https://threespacebackend.onrender.com/${product.imagePath}`} 
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
