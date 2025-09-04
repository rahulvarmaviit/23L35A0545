import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, Paper } from '@mui/material';

// TokenInput lets the user enter and save their Bearer token for API authentication
const TokenInput = () => {
  const [token, setToken] = useState('');
  const [saved, setSaved] = useState(false);

  // Load token from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('bearerToken') || '';
    setToken(stored);
  }, []);

  // Save token to localStorage
  const handleSave = () => {
    localStorage.setItem('bearerToken', token);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
      <Typography variant="subtitle1" gutterBottom>
        Enter your Bearer Token
      </Typography>
      <Box display="flex" alignItems="center" gap={2}>
        <TextField
          label="Bearer Token"
          value={token}
          onChange={e => setToken(e.target.value)}
          sx={{ flex: 1 }}
        />
        <Button variant="contained" onClick={handleSave} disabled={!token}>
          Save
        </Button>
        {saved && <Typography color="success.main">Saved!</Typography>}
      </Box>
    </Paper>
  );
};

export default TokenInput; 