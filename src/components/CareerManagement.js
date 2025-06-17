import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
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
  Divider,
  Snackbar,
  Alert,
  CircularProgress,
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
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // Form state
  const [formData, setFormData] = useState({
    JobTitle: '',
    Field: '',
    workType: '',
    employmentType: '',
    description: '',
    responsibilities: [],
    requirements: [],
  });

  const [tempResponsibility, setTempResponsibility] = useState('');
  const [tempRequirement, setTempRequirement] = useState('');

  // Options
  const workTypeOptions = ['Remote', 'Office', 'Hybrid'];
  const employmentTypeOptions = ['Full Time', 'Part Time', 'Contract'];
  const fieldOptions = ['Engineering', 'Software', 'Production', 'Operations'];

  // Fetch careers
  useEffect(() => {
    const fetchCareers = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/careers/all');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setCareers(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching careers:', error);
        setError(error.message);
        showSnackbar('Error fetching careers', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchCareers();
  }, []);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Add responsibility
  const addResponsibility = () => {
    if (tempResponsibility.trim()) {
      setFormData({
        ...formData,
        responsibilities: [...formData.responsibilities, tempResponsibility.trim()],
      });
      setTempResponsibility('');
    }
  };

  // Remove responsibility
  const removeResponsibility = (index) => {
    const newResponsibilities = [...formData.responsibilities];
    newResponsibilities.splice(index, 1);
    setFormData({
      ...formData,
      responsibilities: newResponsibilities,
    });
  };

  // Add requirement
  const addRequirement = () => {
    if (tempRequirement.trim()) {
      setFormData({
        ...formData,
        requirements: [...formData.requirements, tempRequirement.trim()],
      });
      setTempRequirement('');
    }
  };

  // Remove requirement
  const removeRequirement = (index) => {
    const newRequirements = [...formData.requirements];
    newRequirements.splice(index, 1);
    setFormData({
      ...formData,
      requirements: newRequirements,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const careerData = {
        JobTitle: formData.JobTitle,
        Field: formData.Field,
        workType: formData.workType,
        employmentType: formData.employmentType,
        description: formData.description,
        responsibilities: formData.responsibilities,
        requirements: formData.requirements,
      };

      const url = currentCareer 
        ? `https://threespacebackend.onrender.com/api/careers/${currentCareer._id}` 
        : 'https://threespacebackend.onrender.com/api/careers';
      
      const method = currentCareer ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(careerData),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to save career');
      }

      const data = await response.json();
      
      if (currentCareer) {
        setCareers(careers.map(career => career._id === currentCareer._id ? data : career));
        showSnackbar('Career updated successfully');
      } else {
        setCareers(prevCareers => [data, ...prevCareers]);
        showSnackbar('Career added successfully');
      }
      
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving career:', error);
      showSnackbar(error.message || 'Error saving career', 'error');
    }
  };

  // Handle delete
  const handleDelete = async (careerId) => {
    try {
      const response = await fetch(`https://threespacebackend.onrender.com/api/careers/${careerId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          // Add authorization if needed:
          // 'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || 
          errorData.error || 
          `Delete failed with status ${response.status}`
        );
      }
  
      setCareers(prevCareers => 
        prevCareers.filter(career => career._id !== careerId)
      );
      showSnackbar('Career deleted successfully');
      
    } catch (error) {
      console.error('Delete error details:', error);
      showSnackbar(
        error.message || 'Failed to delete career. Please try again.',
        'error'
      );
    }
  };

  // Handle edit
  const handleEdit = (career) => {
    setCurrentCareer(career);
    setFormData({
      JobTitle: career.JobTitle,
      Field: career.Field,
      workType: career.workType,
      employmentType: career.employmentType,
      description: career.description,
      responsibilities: [...career.responsibilities],
      requirements: [...career.requirements],
    });
    setOpenDialog(true);
  };

  // Toggle active status
  const toggleActiveStatus = async (careerId, currentStatus) => {
    try {
      const response = await fetch(`https://threespacebackend.onrender.com/api/careers/toggle/${careerId}`, {
        method: 'PUT',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to toggle status');
      }
      
      const updatedCareer = await response.json();
      setCareers(prevCareers => 
        prevCareers.map(career => career._id === careerId ? updatedCareer : career)
      );
      showSnackbar(`Career marked as ${updatedCareer.isActive ? 'active' : 'inactive'}`);
    } catch (error) {
      console.error('Error toggling career status:', error);
      showSnackbar(error.message || 'Error toggling career status', 'error');
    }
  };

  // Dialog handlers
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentCareer(null);
    setFormData({
      JobTitle: '',
      Field: '',
      workType: '',
      employmentType: '',
      description: '',
      responsibilities: [],
      requirements: [],
    });
    setTempResponsibility('');
    setTempRequirement('');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <Typography color="error">Error: {error}</Typography>
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
          onClick={() => setOpenDialog(true)}
        >
          Add New Career
        </Button>
      </Box>

      {careers.length === 0 ? (
        <Typography variant="body1" align="center" sx={{ mt: 4 }}>
          No career postings available
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {careers.map((career) => (
            <Grid item xs={12} sm={6} md={4} key={career._id}>
              <Card sx={{ height: '100%' }}>
                <CardHeader
                  title={career.JobTitle}
                  subheader={career.Field}
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
                    <Chip
                      label={career.isActive ? 'Active' : 'Inactive'}
                      color={career.isActive ? 'success' : 'error'}
                      size="small"
                      onClick={() => toggleActiveStatus(career._id, career.isActive)}
                      clickable
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {career.description}
                  </Typography>
                  
                  <Typography variant="subtitle1">Responsibilities:</Typography>
                  <List dense>
                    {career.responsibilities.map((item, index) => (
                      <ListItem key={index}>
                        <ListItemText primary={`• ${item}`} />
                      </ListItem>
                    ))}
                  </List>
                  
                  <Divider sx={{ my: 1 }} />
                  
                  <Typography variant="subtitle1">Requirements:</Typography>
                  <List dense>
                    {career.requirements.map((item, index) => (
                      <ListItem key={index}>
                        <ListItemText primary={`• ${item}`} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Add/Edit Career Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold' }}>
          {currentCareer ? 'Edit Career' : 'Add New Career'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                Job Title *
              </Typography>
              <TextField
                fullWidth
                size="small"
                name="JobTitle"
                value={formData.JobTitle}
                onChange={handleChange}
                required
              />
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                  Field
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    name="Field"
                    value={formData.Field}
                    onChange={handleChange}
                    required
                  >
                    {fieldOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                  Work Type
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    name="workType"
                    value={formData.workType}
                    onChange={handleChange}
                    required
                  >
                    {workTypeOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                  Employment Type
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    name="employmentType"
                    value={formData.employmentType}
                    onChange={handleChange}
                    required
                  >
                    {employmentTypeOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Box sx={{ mt: 2, mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                Description *
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                Responsibilities
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  value={tempResponsibility}
                  onChange={(e) => setTempResponsibility(e.target.value)}
                  placeholder="Add responsibility"
                />
                <Button 
                  variant="contained"
                  onClick={addResponsibility}
                  disabled={!tempResponsibility.trim()}
                  sx={{ whiteSpace: 'nowrap' }}
                >
                  ADD
                </Button>
              </Box>
              <List dense sx={{ mt: 1 }}>
                {formData.responsibilities.map((item, index) => (
                  <ListItem key={index} sx={{ py: 0 }}>
                    <ListItemText primary={`• ${item}`} />
                    <IconButton edge="end" onClick={() => removeResponsibility(index)} size="small">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                Requirements
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  value={tempRequirement}
                  onChange={(e) => setTempRequirement(e.target.value)}
                  placeholder="Add requirement"
                />
                <Button 
                  variant="contained"
                  onClick={addRequirement}
                  disabled={!tempRequirement.trim()}
                  sx={{ whiteSpace: 'nowrap' }}
                >
                  ADD
                </Button>
              </Box>
              <List dense sx={{ mt: 1 }}>
                {formData.requirements.map((item, index) => (
                  <ListItem key={index} sx={{ py: 0 }}>
                    <ListItemText primary={`• ${item}`} />
                    <IconButton edge="end" onClick={() => removeRequirement(index)} size="small">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            </Box>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center', p: 2 }}>
            <Button 
              onClick={handleCloseDialog} 
              variant="outlined"
              sx={{ mr: 2 }}
            >
              CANCEL
            </Button>
            <Button 
              type="submit" 
              variant="contained"
              disabled={
                !formData.JobTitle ||
                !formData.Field ||
                !formData.workType ||
                !formData.employmentType ||
                !formData.description ||
                formData.responsibilities.length === 0 ||
                formData.requirements.length === 0
              }
            >
              {currentCareer ? 'UPDATE CAREER' : 'ADD CAREER'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CareerManagement;