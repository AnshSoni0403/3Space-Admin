const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 5000;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// In-memory storage for products
let products = [
  {
    _id: '1',
    name: 'Sample Product',
    description: 'This is a sample product',
    price: 999,
    oldPrice: 1299,
    isNew: true,
    tags: ['sample', 'test'],
    imagePath: 'uploads/sample.jpg',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Helper function to find a product by ID (supports both simple IDs and MongoDB-style IDs)
const findProductById = (id) => {
  // First try exact match
  let product = products.find(p => p._id === id);
  
  // If not found and ID looks like MongoDB ObjectId, try matching the last few characters
  if (!product && /^[0-9a-fA-F]{24}$/.test(id)) {
    const shortId = id.slice(-1); // Get last character as a simple ID
    product = products.find(p => p._id === shortId);
  }
  
  return product;
};

// Helper function to find product index by ID
const findProductIndexById = (id) => {
  // First try exact match
  let index = products.findIndex(p => p._id === id);
  
  // If not found and ID looks like MongoDB ObjectId, try matching the last few characters
  if (index === -1 && /^[0-9a-fA-F]{24}$/.test(id)) {
    const shortId = id.slice(-1); // Get last character as a simple ID
    index = products.findIndex(p => p._id === shortId);
  }
  
  return index;
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// API Routes
app.get('/api/products', (req, res) => {
  res.json(products);
});

// Get all products
app.get('/api/products', (req, res) => {
  res.json(products);
});

// Get single product
app.get('/api/products/:id', (req, res) => {
  const product = findProductById(req.params.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  res.json({ success: true, data: product });
});

// Create product
app.post('/api/products', upload.single('image'), (req, res) => {
  const { name, description, price, oldPrice, isNew, tags } = req.body;
  const newProduct = {
    _id: Date.now().toString(),
    name,
    description,
    price: Number(price),
    oldPrice: oldPrice ? Number(oldPrice) : null,
    isNew: isNew === 'true',
    tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
    imagePath: req.file ? 'uploads/' + req.file.filename : null,
    createdAt: new Date()
  };
  
  products.push(newProduct);
  res.status(201).json(newProduct);
});

// Update product
app.put('/api/products/:id', upload.single('image'), (req, res) => {
  try {
    const { name, description, price, oldPrice, isNew, tags } = req.body;
    const productIndex = findProductIndexById(req.params.id);
    
    if (productIndex === -1) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const updateData = {
      name,
      description,
      price: Number(price),
      oldPrice: oldPrice ? Number(oldPrice) : null,
      isNew: isNew === 'true',
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim())) : [],
    };

    // Update image if a new one was uploaded
    if (req.file) {
      updateData.imagePath = 'uploads/' + req.file.filename.replace(/\\/g, '/');
    }

    const updatedProduct = {
      ...products[productIndex],
      ...updateData,
      updatedAt: new Date()
    };

    products[productIndex] = updatedProduct;
    res.json({ success: true, data: updatedProduct });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Delete product
app.delete('/api/products/:id', (req, res) => {
  try {
    const productIndex = findProductIndexById(req.params.id);
    
    if (productIndex === -1) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // In a real app, you'd want to delete the associated image file here
    // fs.unlinkSync(products[productIndex].imagePath);
    
    products.splice(productIndex, 1);
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Mock API server running at http://localhost:${port}`);
  console.log('Available endpoints:');
  console.log(`  GET    http://localhost:${port}/api/products`);
  console.log(`  GET    http://localhost:${port}/api/products/:id`);
  console.log(`  POST   http://localhost:${port}/api/products`);
  console.log(`  PUT    http://localhost:${port}/api/products/:id`);
  console.log(`  DELETE http://localhost:${port}/api/products/:id`);
});
