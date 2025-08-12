import React, { useEffect, useState } from 'react';
import {
  Box, Typography, CircularProgress,
  Alert, Paper, TableContainer, Button,
  Table, TableHead, TableRow, Tabs, Tab,
  TableCell, TableBody, IconButton, Snackbar
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { API_BASE_URL } from './config';

const Inquiries = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/contact`);
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
      const response = await fetch(`${API_BASE_URL}/contact/${id}`, {
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

  const handleMarkAsViewed = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/contact/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ viewed: true })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update contact status');
      }

      // Update local state to reflect the change
      setMessages(messages.map(msg => 
        msg._id === id ? { ...msg, viewed: true } : msg
      ));
      
      setSnackbar({
        open: true,
        message: 'Message marked as viewed',
        severity: 'success'
      });
      
    } catch (error) {
      console.error("Update error:", error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to update message status',
        severity: 'error'
      });
    }
  };

  const unreadMessages = messages.filter(msg => !msg.viewed);
  const seenMessages = messages.filter(msg => msg.viewed);

  const renderMessagesTable = (messagesList) => (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Table sx={{ minWidth: 650 }} aria-label="inquiries table">
        <TableHead>
          <TableRow>
            <TableCell><strong>Name</strong></TableCell>
            <TableCell><strong>Email</strong></TableCell>
            <TableCell><strong>Message</strong></TableCell>
            <TableCell><strong>Date</strong></TableCell>
            <TableCell><strong>Actions</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {messagesList.map((msg) => (
            <TableRow 
              key={msg._id}
              sx={{ 
                backgroundColor: msg.viewed ? 'action.hover' : 'background.paper',
                '&:hover': { backgroundColor: 'action.hover' }
              }}
            >
              <TableCell>{msg.name}</TableCell>
              <TableCell>{msg.email}</TableCell>
              <TableCell>{msg.message}</TableCell>
              <TableCell>{new Date(msg.createdAt).toLocaleString()}</TableCell>
              <TableCell>
                {!msg.viewed && (
                  <IconButton 
                    color="primary" 
                    onClick={() => handleMarkAsViewed(msg._id)}
                    title="Mark as viewed"
                  >
                    <CheckCircleIcon />
                  </IconButton>
                )}
                <IconButton 
                  color="error" 
                  onClick={() => handleDelete(msg._id)}
                  title="Delete message"
                >
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Customer Inquiries
      </Typography>

      <Tabs 
        value={activeTab} 
        onChange={(e, newValue) => setActiveTab(newValue)}
        sx={{ mb: 3 }}
      >
        <Tab label={`Unread (${unreadMessages.length})`} />
        <Tab label={`Seen (${seenMessages.length})`} />
      </Tabs>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">Error: {error}</Alert>
      ) : messages.length === 0 ? (
        <Typography>No inquiries found.</Typography>
      ) : (
        <>
          {activeTab === 0 && (
            <>
              {unreadMessages.length > 0 ? (
                renderMessagesTable(unreadMessages)
              ) : (
                <Typography>No unread messages.</Typography>
              )}
            </>
          )}
          
          {activeTab === 1 && (
            <>
              {seenMessages.length > 0 ? (
                renderMessagesTable(seenMessages)
              ) : (
                <Typography>No seen messages yet.</Typography>
              )}
            </>
          )}
        </>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Inquiries;