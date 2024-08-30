import React, { useState } from 'react';
import { createAppToken } from '../../api'; // API fonksiyonunu import ediyoruz
import { TextField, Button, Typography, Container, Paper, Box, IconButton } from '@mui/material';
import { ContentCopy } from '@mui/icons-material';

const AppTokenForm = () => {
  const [name, setName] = useState('');
  const [expiresIn, setExpiresIn] = useState('');
  const [createdToken, setCreatedToken] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setCreatedToken('');

    try {
      const tokenData = { name, expiresIn };
      const response = await createAppToken(tokenData);
      setSuccessMessage('App token created successfully!');
      setCreatedToken(response.token); // Oluşan token'ı sakla
      setName('');
      setExpiresIn('');
    } catch (error) {
      setError('Failed to create app token.');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(createdToken);
    setSuccessMessage('Token copied to clipboard!');
  };

  return (
    <Container component={Paper} sx={{ padding: 3, marginTop: 3 }}>
      <Typography variant="h5" gutterBottom>
        Create App Token
      </Typography>
      {error && <Typography color="error">{error}</Typography>}
      {successMessage && <Typography color="primary">{successMessage}</Typography>}
      <form onSubmit={handleSubmit}>
        <TextField
          label="Token Name"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          sx={{ marginBottom: 2 }}
        />
        <TextField
          label="Expires In (e.g., 1d, 7d, unlimited)"
          fullWidth
          value={expiresIn}
          onChange={(e) => setExpiresIn(e.target.value)}
          required
          sx={{ marginBottom: 2 }}
        />
        <Button type="submit" variant="contained" color="primary" sx={{ marginBottom: 2 }}>
          Create Token
        </Button>
      </form>

      {createdToken && (
        <Box sx={{ display: 'flex', alignItems: 'center', marginTop: 2 }}>
          <TextField
            label="Generated Token"
            fullWidth
            value={createdToken}
            InputProps={{
              readOnly: true,
            }}
            sx={{ marginRight: 1 }}
          />
          <IconButton color="primary" onClick={handleCopy}>
            <ContentCopy />
          </IconButton>
        </Box>
      )}
    </Container>
  );
};

export default AppTokenForm;
