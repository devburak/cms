import React, { useState } from 'react';
import { Container, Grid, Snackbar, Alert } from '@mui/material';
import VideoForm from '../components/video/VideoForm';
import VideoList from '../components/video/VideoList';
import { useTranslation } from 'react-i18next';

const VideosPage = () => {
  const { t } = useTranslation();
  const [selectedVideoId, setSelectedVideoId] = useState(null);
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
          <VideoForm 
            videoId={selectedVideoId}
            onSuccess={(msg) => {
              handleNotification(msg, 'success');
              setSelectedVideoId(null);
            }}
            onError={(msg) => handleNotification(msg, 'error')}
          />
        </Grid>
        <Grid item xs={12} sx={{ marginTop: 4 }}>
          <VideoList 
            onEdit={(videoId) => setSelectedVideoId(videoId)}
            notificy={notification}
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

export default VideosPage;
