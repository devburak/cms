import React, { useEffect, useState } from 'react';
import { listAppTokens, deleteAppToken } from '../../api'; // API fonksiyonlarını import ediyoruz
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Typography, Container } from '@mui/material';
import { Delete } from '@mui/icons-material';

const AppTokenList = () => {
  const [appTokens, setAppTokens] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAppTokens();
  }, []);

  const fetchAppTokens = async () => {
    try {
      const tokens = await listAppTokens();
      setAppTokens(tokens);
    } catch (error) {
      setError('Failed to fetch app tokens.');
    }
  };

  const handleDelete = async (tokenId) => {
    if (window.confirm('Are you sure you want to delete this token?')) {
      try {
        await deleteAppToken(tokenId);
        fetchAppTokens(); // Silme işleminden sonra listeyi yenile
      } catch (error) {
        setError('Failed to delete app token.');
      }
    }
  };

  return (
    <Container component={Paper} sx={{ padding: 3, marginTop: 3 }}>
      <Typography variant="h5" gutterBottom>
        App Tokens
      </Typography>
      {error && <Typography color="error">{error}</Typography>}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Token Name</TableCell>
              <TableCell>Expires In</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {appTokens.map((token) => (
              <TableRow key={token._id}>
                <TableCell>{token.name}</TableCell>
                <TableCell>{token.expiresIn}</TableCell>
                <TableCell>{new Date(token.createdAt).toLocaleString()}</TableCell>
                <TableCell>
                  <IconButton color="secondary" onClick={() => handleDelete(token._id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default AppTokenList;
