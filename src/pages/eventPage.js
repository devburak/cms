import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import EventForm from '../components/event/eventForm';

const EventPage = () => {
  const { id } = useParams(); // URL'den ID'yi alıyoruz
  const navigate = useNavigate();

  const handleSave = () => {
    // Kaydetme sonrası yönlendirme veya başka işlem
    navigate('/events');
  };

  return (
    <div>
      <h1>{id ? 'Update Event' : 'Create New Event'}</h1>
      <EventForm eventId={id} onSave={handleSave} />
    </div>
  );
};

export default EventPage;
