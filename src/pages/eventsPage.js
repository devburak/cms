import React from 'react';
import EventList from '../components/event/eventList';
import { useTranslation } from 'react-i18next';

const EventsPage = () => {
  const { t } = useTranslation();

  return (
    <div>
      <h2>{t('Events Management')}</h2>
      <EventList />
    </div>
  );
};

export default EventsPage;
