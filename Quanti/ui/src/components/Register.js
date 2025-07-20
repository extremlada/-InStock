import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Paper, 
  TextField, 
  Button, 
  Typography, 
  Alert,
  Link,
  Stack
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

function Register() {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('A jelszavak nem egyeznek!');
      return;
    }

    if (formData.password.length < 6) {
      setError('A jelszó legalább 6 karakter hosszú legyen!');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          username: formData.username,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Regisztráció sikertelen!');
      }

      setSuccess('Sikeres regisztráció! Átirányítás a bejelentkezéshez...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}
      >
        <Paper
          elevation={10}
          sx={{
            p: 4,
            borderRadius: 3,
            width: '100%',
            maxWidth: 400
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            align="center"
            sx={{ fontWeight: 600, color: '#333', mb: 3 }}
          >
            Regisztráció
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                name="email"
                type="email"
                label="Email cím"
                value={formData.email}
                onChange={handleChange}
                required
                fullWidth
                autoComplete="email"
              />

              <TextField
                name="username"
                label="Felhasználónév"
                value={formData.username}
                onChange={handleChange}
                required
                fullWidth
                autoComplete="username"
              />

              <TextField
                name="password"
                type="password"
                label="Jelszó"
                value={formData.password}
                onChange={handleChange}
                required
                fullWidth
                autoComplete="new-password"
              />

              <TextField
                name="confirmPassword"
                type="password"
                label="Jelszó megerősítése"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                fullWidth
                autoComplete="new-password"
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  py: 1.5,
                  background: 'linear-gradient(90deg, #667eea, #764ba2)',
                  '&:hover': {
                    background: 'linear-gradient(90deg, #5a6fd8, #6a4190)'
                  }
                }}
              >
                {loading ? 'Regisztráció...' : 'Regisztráció'}
              </Button>

              <Typography align="center" variant="body2">
                Már van fiókod?{' '}
                <Link
                  component="button"
                  variant="body2"
                  onClick={() => navigate('/login')}
                  sx={{ textDecoration: 'none' }}
                >
                  Bejelentkezés
                </Link>
              </Typography>
            </Stack>
          </form>
        </Paper>
      </Box>
    </Container>
  );
}

export default Register;