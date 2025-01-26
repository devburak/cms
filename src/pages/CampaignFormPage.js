import React from 'react';
import CampaignForm from '../components/campaign/CampaignForm';
import { Box, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const CampaignFormPage = () => {
  const { id } = useParams();
  const { t } = useTranslation();

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        {id
          ? t('campaign.form.editTitle', 'Kampanya Düzenle')
          : t('campaign.form.createTitle', 'Yeni Kampanya Oluştur')}
      </Typography>
      <Typography variant="body1" gutterBottom>
        {t(
          'campaign.form.description',''
        )}
      </Typography>
      <CampaignForm />
    </Box>
  );
};

export default CampaignFormPage;
