import React, { useEffect, useState } from 'react';
import {
  Box, Typography, CircularProgress,
  Alert, Paper, TableContainer,
  Table, TableHead, TableRow,
  TableCell, TableBody, IconButton, Snackbar
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const Inquiries = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://threespacebackend.onrender.com/api/contact');
      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(json.message || "Failed to fetch inquiries.");
      }
      console.log("Fetched messages:", json.data);  // Debug log
      setMessages(json.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    console.log("Trying to delete contact with ID:", id);
    
    try {
      const response = await fetch(`https://threespacebackend.onrender.com/api/contact/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete contact');
      }

      const data = await response.json();
      console.log("Deleted successfully:", data);
      
      // Refresh the contacts list after successful deletion
      fetchMessages();
      
    } catch (error) {
      console.error("Delete error:", error);
      setError(error.message);
    }
  };


  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Customer Inquiries
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">Error: {error}</Alert>
      ) : messages.length === 0 ? (
        <Typography>No inquiries found.</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="inquiries table">
            <TableHead>
              <TableRow>
                <TableCell><strong>Name</strong></TableCell>
                <TableCell><strong>Email</strong></TableCell>
                <TableCell><strong>Message</strong></TableCell>
                <TableCell><strong>Date</strong></TableCell>
                <TableCell><strong>Action</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {messages.map((msg) => (
                <TableRow key={msg._id}>
                  <TableCell>{msg.name}</TableCell>
                  <TableCell>{msg.email}</TableCell>
                  <TableCell>{msg.message}</TableCell>
                  <TableCell>{new Date(msg.createdAt).toLocaleString()}</TableCell>
                  <TableCell>
                    <IconButton color="error" onClick={() => handleDelete(msg._id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
};

export default Inquiries;
