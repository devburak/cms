import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import EventForm from '../components/event/eventForm';
import { Box, Button, Container, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

const EventPage = () => {
  const { id } = useParams(); // URL'den ID'yi alıyoruz
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSave = () => {
    // Kaydetme sonrası yönlendirme veya başka işlem
    navigate('/events');
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          {id ? t('Update Event') : t('Create New Event')}
        </Typography>
        <Button
          variant="outlined"
          onClick={() => navigate('/events')}
          sx={{ textTransform: 'none' }}
        >
          ← {t('Go to Event List')}
        </Button>
      </Box>
      <Box>
        <EventForm eventId={id} onSave={handleSave} />
      </Box>
    </Container>
  );
};

export default EventPage;
