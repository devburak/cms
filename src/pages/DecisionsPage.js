import React, { useState } from 'react';
import { Alert, Container, Grid, Snackbar } from '@mui/material';
import DecisionForm from '../components/decision/DecisionForm';
import DecisionList from '../components/decision/DecisionList';

export default function DecisionsPage() {
  const [selectedDecision, setSelectedDecision] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleNotification = (message, severity = 'success') => {
    setNotification({ open: true, message, severity });
  };

  const handleCloseNotification = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };

  return (
    <Container maxWidth="lg">
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <DecisionForm
            decision={selectedDecision}
            onSuccess={(message) => {
              handleNotification(message, 'success');
              setSelectedDecision(null);
              setReloadKey((prev) => prev + 1);
            }}
            onError={(message) => handleNotification(message, 'error')}
          />
        </Grid>
        <Grid item xs={12} sx={{ mt: 4 }}>
          <DecisionList
            reloadKey={reloadKey}
            onEdit={(item) => setSelectedDecision(item)}
            onNotify={handleNotification}
          />
        </Grid>
        <Snackbar open={notification.open} autoHideDuration={6000} onClose={handleCloseNotification}>
          <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
            {notification.message}
          </Alert>
        </Snackbar>
      </Grid>
    </Container>
  );
}
