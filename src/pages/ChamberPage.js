import React, { useState } from 'react';
import { Container, Grid, Snackbar, Alert } from '@mui/material';
import ChamberList from '../components/chamber/ChamberList';
import ChamberForm from '../components/chamber/ChamberForm';
import { useTranslation } from 'react-i18next';

const ChamberPage = () => {
  const { t } = useTranslation();
  const [selectedChamber, setSelectedChamber] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  const handleNotification = (message, severity = 'success') => {
    setNotification({ open: true, message, severity });
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  return (
    <Container maxWidth="lg">
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <ChamberForm 
            chamber={selectedChamber}
            onSuccess={(msg) => {
              handleNotification(msg, 'success');
              setSelectedChamber(null);
            }}
            onError={(msg) => handleNotification(msg, 'error')}
          />
        </Grid>
        <Grid item xs={12} sx={{ marginTop: 4 }}>
          <ChamberList 
            onEdit={(chamber) => setSelectedChamber(chamber)}
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

export default ChamberPage;
