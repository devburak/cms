import React, { useState } from 'react';
import { Container, Grid, Snackbar, Alert } from '@mui/material';
import BoardList from '../components/chamber/BoardList';
import BoardForm from '../components/chamber/BoardForm';
import { useTranslation } from 'react-i18next';

const BoardPage = () => {
  const { t } = useTranslation();
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  const handleNotification = (message, severity = 'success') => {
    setNotification({ open: true, message, severity });
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  return (
    <Container maxWidth="lg" sx={{marginTop:4}}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <BoardForm 
            board={selectedBoard}
            onSuccess={(msg) => {
              handleNotification(msg, 'success');
              setSelectedBoard(null);
            }}
            onError={(msg) => handleNotification(msg, 'error')}
          />
        </Grid>
        <Grid item xs={12} sx={{ marginTop: 4 }}>
          <BoardList 
            onEdit={(board) => setSelectedBoard(board)}
            onNotify={handleNotification}
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

export default BoardPage;
