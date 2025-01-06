import React from 'react';
import EventList from '../components/event/eventList';
import { useTranslation } from 'react-i18next';
import { Box, Button, Container, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const EventsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Sayfa Başlığı */}
      <head>
        <title>{t('Events')}</title>
      </head>

      {/* Başlık ve Listeye Git Butonu */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h3">
          {t('Events')}
        </Typography>
        <Button
          variant="outlined"
          onClick={() => navigate('/event')}
          sx={{ textTransform: 'none' }}
        >
          ← {t('Go to Event')}
        </Button>
      </Box>

      {/* Event List */}
      <Box>
        <EventList />
      </Box>
    </Container>
  );
};

export default EventsPage;
