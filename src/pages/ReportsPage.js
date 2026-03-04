import React, { useState } from 'react';
import { Container, Grid, Snackbar, Alert } from '@mui/material';
import ReportForm from '../components/report/ReportForm';
import ReportList from '../components/report/ReportList';

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState(null);
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
          <ReportForm
            report={selectedReport}
            onSuccess={(message) => {
              handleNotification(message, 'success');
              setSelectedReport(null);
              setReloadKey((prev) => prev + 1);
            }}
            onError={(message) => handleNotification(message, 'error')}
          />
        </Grid>
        <Grid item xs={12} sx={{ mt: 4 }}>
          <ReportList
            reloadKey={reloadKey}
            onEdit={(item) => setSelectedReport(item)}
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
