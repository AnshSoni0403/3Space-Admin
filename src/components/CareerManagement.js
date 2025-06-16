import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

const CareerManagement = () => {
  const [careers, setCareers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentCareer, setCurrentCareer] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    jobTitle: '',
    field: '',
    workType: '',
    employmentType: '',
    description: '',
    responsibilities: '',
    requirements: '',
  });

  // Work type options
  const workTypeOptions = [
    { value: 'remote', label: 'Remote' },
    { value: 'office', label: 'Office' },
    { value: 'hybrid', label: 'Hybrid' },
  ];

  // Employment type options
  const employmentTypeOptions = [
    { value: 'fulltime', label: 'Full-time' },
    { value: 'parttime', label: 'Part-time' },
    { value: 'contract', label: 'Contract' },
  ];

  // Fetch careers
  useEffect(() => {
    const fetchCareers = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/careers');
        const data = await response.json();
        setCareers(data);
      } catch (error) {
        console.error('Error fetching careers:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCareers();
  }, []);

  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = currentCareer ? `http://localhost:5000/api/careers/${currentCareer._id}` : 'http://localhost:5000/api/careers';
      const method = currentCareer ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (currentCareer) {
          setCareers(careers.map(career => career._id === currentCareer._id ? data : career));
        } else {
          setCareers([...careers, data]);
        }
        handleCloseDialog();
      }
    } catch (error) {
      console.error('Error saving career:', error);
    }
  };

  // Handle delete
  const handleDelete = async (careerId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/careers/${careerId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setCareers(careers.filter(career => career._id !== careerId));
      }
    } catch (error) {
      console.error('Error deleting career:', error);
    }
  };

  // Handle edit
  const handleEdit = (career) => {
    setCurrentCareer(career);
    setFormData({
      jobTitle: career.jobTitle,
      field: career.field,
      workType: career.workType,
      employmentType: career.employmentType,
      description: career.description,
      responsibilities: career.responsibilities,
      requirements: career.requirements,
    });
    setOpenDialog(true);
  };

  // Dialog handlers
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentCareer(null);
    setFormData({
      jobTitle: '',
      field: '',
      workType: '',
      employmentType: '',
      description: '',
      responsibilities: '',
      requirements: '',
    });
  };

  // Format responsibilities and requirements as list items
  const formatList = (text) => {
    if (!text) return [];
    return text.split('\n').filter(item => item.trim());
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        Loading...
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Career Management
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setCurrentCareer(null);
            setOpenDialog(true);
          }}
        >
          Add New Career
        </Button>
      </Box>

      <Grid container spacing={3}>
        {careers.map((career) => (
          <Grid item xs={12} sm={6} md={4} key={career._id}>
            <Card sx={{ height: '100%' }}>
              <CardHeader
                title={career.jobTitle}
                subheader={career.field}
                action={
                  <Box>
                    <IconButton onClick={() => handleEdit(career)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(career._id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                }
              />
              <CardContent>
                <Box sx={{ mb: 2 }}>
                  <Chip
                    label={`${career.workType} / ${career.employmentType}`}
                    size="small"
                    sx={{ mr: 1 }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {career.description}
                </Typography>
                <Typography variant="h6" sx={{ mt: 2 }}>
                  Responsibilities:
                </Typography>
                <List dense>
                  {formatList(career.responsibilities).map((item, index) => (
                    <ListItem key={index}>
                      <ListItemText primary={item} />
                    </ListItem>
                  ))}
                </List>
                <Typography variant="h6" sx={{ mt: 2 }}>
                  Requirements:
                </Typography>
                <List dense>
                  {formatList(career.requirements).map((item, index) => (
                    <ListItem key={index}>
                      <ListItemText primary={item} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add/Edit Career Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{currentCareer ? 'Edit Career' : 'Add New Career'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              name="jobTitle"
              label="Job Title"
              type="text"
              fullWidth
              value={formData.jobTitle}
              onChange={handleChange}
              required
            />
            <TextField
              margin="dense"
              name="field"
              label="Field"
              type="text"
              fullWidth
              value={formData.field}
              onChange={handleChange}
              required
            />
            <FormControl fullWidth margin="dense">
              <InputLabel>Work Type</InputLabel>
              <Select
                name="workType"
                value={formData.workType}
                onChange={handleChange}
                required
              >
                {workTypeOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="dense">
              <InputLabel>Employment Type</InputLabel>
              <Select
                name="employmentType"
                value={formData.employmentType}
                onChange={handleChange}
                required
              >
                {employmentTypeOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              margin="dense"
              name="description"
              label="Description"
              type="text"
              fullWidth
              multiline
              rows={4}
              value={formData.description}
              onChange={handleChange}
              required
            />
            <TextField
              margin="dense"
              name="responsibilities"
              label="Responsibilities (one per line)"
              type="text"
              fullWidth
              multiline
              rows={4}
              value={formData.responsibilities}
              onChange={handleChange}
              required
            />
            <TextField
              margin="dense"
              name="requirements"
              label="Requirements (one per line)"
              type="text"
              fullWidth
              multiline
              rows={4}
              value={formData.requirements}
              onChange={handleChange}
              required
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} startIcon={<CancelIcon />}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" startIcon={<SaveIcon />}>
              {currentCareer ? 'Update' : 'Add'} Career
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default CareerManagement;
