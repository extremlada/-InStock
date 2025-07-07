import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Typography, Paper } from '@mui/material';
import { Navigate, Outlet } from 'react-router-dom';


function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/token/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error('Hibás email vagy jelszó!');
      if (!data.access) throw new Error('Nincs access token!');
      localStorage.setItem('access', data.access);
      localStorage.setItem('refresh', data.refresh);

      const userRes = await fetch('/api/current-user/', {
        headers: { 'Authorization': `Bearer ${data.access}` }
      });
      if (!userRes.ok) throw new Error('Nem sikerült lekérni a felhasználót!');
      const user = await userRes.json();
      localStorage.setItem('username', user.username);
      localStorage.setItem('email', user.email);

      navigate('/');
    } catch (err) {
      setError(err.message);
      console.error(err);
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <Paper sx={{ p: 4, minWidth: 320 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>Bejelentkezés</Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Email"
            type="email"
            fullWidth
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Jelszó"
            type="password"
            fullWidth
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            sx={{ mb: 2 }}
          />
          {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
          <Button type="submit" variant="contained" fullWidth>Belépés</Button>
        </form>
      </Paper>
    </Box>
  );
}

export default Login;