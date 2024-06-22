import { useEffect, useState, ChangeEvent, FocusEvent } from 'react';
import { Typography, Container, Grid, TextField, Button, Snackbar, Alert, FormControl } from '@mui/material';
import axios from '../libs/api';

interface Profile {
  username: string;
  email: string;
  phone: string;
}

function Profile() {
  const [profile, setProfile] = useState<Profile>({ username: '', email: '', phone: '' });
  const [editMode, setEditMode] = useState(false);
  const [errors, setErrors] = useState({ username: '', email: '', phone: '' });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  useEffect(() => {
    axios
      .get('/api/profile')
      .then((data) => {
        setProfile(data?.data || { username: '', email: '', phone: '' });
      })
      .catch((err) => console.error('Error fetching profile:', err));
  }, []);

  const validateField = (name: string, value: string): string => {
    if (!value) return 'This field is required';

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    const phoneRegex = /^\+?([0-9]{1,4})?([0-9]{10})$/;
    const usernameRegex = /^[a-zA-Z\u4e00-\u9fa5]+$/; // 允许英文和中文，不允许特殊字符

    switch (name) {
      case 'username':
        if (!usernameRegex.test(value)) return 'Username must only contain English and Chinese characters';
        if (value.length < 3 || value.length > 12) return 'Username must be 3-12 characters long';
        break;
      case 'email':
        if (!emailRegex.test(value)) return 'Enter a valid email address';
        break;
      case 'phone':
        if (!phoneRegex.test(value)) return 'Enter a valid phone number';
        break;
    }

    return '';
  };

  const handleEditToggle = () => {
    setEditMode(!editMode);
    if (editMode) {
      setErrors({
        username: '',
        email: '',
        phone: '',
      });
    }
  };

  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setProfile({ ...profile, [name]: value });
    // 动态校验
    const error = validateField(name, value);
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: error,
    }));
  };

  const handleSave = () => {
    let valid = true;
    const newErrors = { username: '', email: '', phone: '' };
    Object.keys(newErrors).forEach((key) => {
      const error = validateField(key, profile[key as keyof typeof profile]);
      if (error) valid = false;
      newErrors[key as keyof typeof newErrors] = error;
    });
    if (!valid) {
      setErrors(newErrors);
      return;
    }

    axios
      .post('/api/profile', profile)
      .then(() => {
        setEditMode(false);
        setSnackbarMessage('Profile successfully updated.');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      })
      .catch((err) => {
        console.error('Error updating profile:', err);
        setSnackbarMessage('Failed to update profile.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      });
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <Container sx={{ p: 2 }}>
      <Typography variant="h4" align="left" gutterBottom>
        Profile
      </Typography>
      <Grid>
        <form>
          <Grid item xs={12} sm={6}>
            <FormControl error={!!errors.username} fullWidth>
              <TextField
                name="username"
                label="Username"
                value={profile.username}
                onChange={handleChange}
                onBlur={handleBlur}
                error={!!errors.username}
                helperText={errors.username}
                disabled={!editMode}
                margin="normal"
                fullWidth
                required
              />
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl error={!!errors.email} fullWidth>
              <TextField
                name="email"
                label="Email"
                value={profile.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={!!errors.email}
                helperText={errors.email}
                disabled={!editMode}
                margin="normal"
                fullWidth
                required
              />
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl error={!!errors.phone} fullWidth>
              <TextField
                name="phone"
                label="Phone"
                value={profile.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                error={!!errors.phone}
                helperText={errors.phone}
                disabled={!editMode}
                margin="normal"
                fullWidth
                required
              />
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Button onClick={handleEditToggle} color="primary">
              {editMode ? 'Cancel' : 'Edit'}
            </Button>
            {editMode && (
              <Button onClick={handleSave} color="primary">
                Save
              </Button>
            )}
          </Grid>
          <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={handleCloseSnackbar}>
            <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
              {snackbarMessage}
            </Alert>
          </Snackbar>
        </form>
      </Grid>
    </Container>
  );
}

export default Profile;
