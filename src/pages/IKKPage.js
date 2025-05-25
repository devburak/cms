import React, { useState, useEffect } from 'react';
import IKKForm from '../components/chamber/IKKForm';
import IKKList from '../components/chamber/IKKList';
import { Container, Typography, Box, Snackbar, Alert } from '@mui/material';

const IKKPage = () => {
  const [selectedIKK, setSelectedIKK] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleEdit = (ikk) => setSelectedIKK(ikk);
  const handleSuccess = (message) => {
    setSnackbar({ open: true, message, severity: 'success' });
    setRefresh(r => !r);
    setSelectedIKK(null);
  };
  const handleError = (message) => {
    setSnackbar({ open: true, message, severity: 'error' });
  };
  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 3 }}>
      <Typography variant="h4" gutterBottom>İKK Yönetimi</Typography>
      <Box mb={3}>
        <IKKForm
          ikk={selectedIKK}
          onSuccess={handleSuccess}
          onError={handleError}
        />
      </Box>
      <IKKList
        onEdit={handleEdit}
        refreshTrigger={refresh}
        onNotify={(message, severity) => setSnackbar({ open: true, message, severity })}
        onSuccess={() => setRefresh(r => !r)}
      />
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default IKKPage;