import React, { useState } from 'react';
import { Container, Grid, Snackbar, Alert } from '@mui/material';
import BoardTypeForm from '../components/chamber/BoardTypeForm';
// import { useTranslation } from 'react-i18next';

const BoardTypesPage = () => {
//   const { t } = useTranslation();
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  const handleNotification = (message, severity = 'success') => {
    setNotification({ open: true, message, severity });
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  return (
    <Container maxWidth="lg" sx={{ marginTop: 4 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <BoardTypeForm 
            onSuccess={(msg) => handleNotification(msg, 'success')}
            onError={(msg) => handleNotification(msg, 'error')}
          />
        </Grid>
        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={handleCloseNotification}
        >
          <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
            {notification.message}
          </Alert>
        </Snackbar>
      </Grid>
    </Container>
  );
};

export default BoardTypesPage;
