// pages/PublicationsPage.js
import React, { useState } from 'react';
import { Grid, Snackbar, Alert, Container } from '@mui/material'; // Import Container
import PublicationList from '../components/publication/PublicationList';
import PublicationForm from '../components/publication/PublicationForm';
import { useTranslation } from 'react-i18next';

const PublicationsPage = () => {
  const { t } = useTranslation();
  const [selectedPublication, setSelectedPublication] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  const handleNotification = (message, severity = 'success') => {
    setNotification({ open: true, message, severity });
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  return (
    <Container maxWidth="lg"> {/* Set maxWidth to lg */}
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <PublicationForm 
            publication={selectedPublication}
            onSuccess={(msg) => {
              handleNotification(msg, 'success');
              setSelectedPublication(null);
            }}
            onError={(msg) => handleNotification(msg, 'error')}
          />
        </Grid>
        <Grid item xs={12} sx={{marginTop:4}}>
          <PublicationList 
            onEdit={(pub) => setSelectedPublication(pub)}
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

export default PublicationsPage;