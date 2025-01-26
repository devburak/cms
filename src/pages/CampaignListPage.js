import React from 'react';
import CampaignList from '../components/campaign/CampaignList';
import { Box, Typography,Container } from '@mui/material';
import { useTranslation } from 'react-i18next';

const CampaignListPage = () => {
  const { t } = useTranslation();

  return (
    <Container sx={{ padding: 4 }} maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        {t('campaign.list.title', 'Kampanya Listesi')}
      </Typography>
      <Typography variant="body1" gutterBottom>
        {t('campaign.list.description', 'Tüm kampanyalarınızı buradan görüntüleyebilir, düzenleyebilir ve yönetebilirsiniz.')}
      </Typography>
      <CampaignList />
    </Container>
  );
};

export default CampaignListPage;
