// components/settings/DefaultImageSetting.js
import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import FeaturedImageUpload from '../file/featuredImage';
import { getSystemVariable, setSystemVariable } from '../../api';
import { notifyError, notifySuccess } from '../../services/notificationBus';
import { useTranslation } from 'react-i18next';

const DefaultImageSetting = () => {
  const { t } = useTranslation();
  const [defaultImage, setDefaultImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchDefaultImage();
  }, []);

  const fetchDefaultImage = async () => {
    try {
      setLoading(true);
      const response = await getSystemVariable('defaultImage');
      if (response?.value) {
        setDefaultImage(response.value);
      }
    } catch (error) {
      // 404 is expected if not set yet
      if (error?.response?.status !== 404) {
        console.error('Error fetching default image:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (image) => {
    setDefaultImage(image);
  };

  const handleSave = async () => {
    if (!defaultImage?.url) {
      notifyError('Lütfen bir görsel seçin.');
      return;
    }

    setSaving(true);
    try {
      await setSystemVariable('defaultImage', defaultImage, 'Varsayılan öne çıkan görsel');
      notifySuccess('Varsayılan görsel kaydedildi.');
    } catch (error) {
      console.error('Error saving default image:', error);
      notifyError('Varsayılan görsel kaydedilemedi.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        {t('Varsayılan Öne Çıkan Görsel')}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {t('Öne çıkan görseli olmayan içerikler için bu görsel kullanılacaktır.')}
      </Typography>

      <Alert severity="info" sx={{ mb: 2 }}>
        Bu ayar değiştirildiğinde webhook ile tüm istemcilere bildirilecektir.
      </Alert>

      <Box sx={{ mb: 2 }}>
        <FeaturedImageUpload
          handleFeaturedImage={handleImageChange}
          initialFile={defaultImage}
          sx={{ width: '400px', height: '225px' }}
        />
      </Box>

      {defaultImage?.url && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          URL: {defaultImage.url}
        </Typography>
      )}

      <Button
        variant="contained"
        color="primary"
        onClick={handleSave}
        disabled={saving || !defaultImage?.url}
      >
        {saving ? <CircularProgress size={24} /> : t('Kaydet')}
      </Button>
    </Paper>
  );
};

export default DefaultImageSetting;
