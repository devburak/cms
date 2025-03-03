import React, { useState, useEffect } from 'react';
import { TextField, Button, Paper, Grid } from '@mui/material';
import { createVideo, updateVideo, getVideoById } from '../../api.js';
import { useTranslation } from 'react-i18next';

const VideoForm = ({ videoId, onSuccess, onError }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    title: '',
    link: '',
    videoId: '',
    provider: 'youtube',
    embedCode: ''
  });

  useEffect(() => {
    if (videoId) {
      (async () => {
        try {
          const video = await getVideoById(videoId);
          setFormData(video);
        } catch (err) {
          console.error('Error fetching video:', err);
          onError && onError(t('errorFetchingVideo'));
        }
      })();
    }
  }, [videoId, onError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'link' && value.includes('youtube.com/watch?v=')) {
      const videoId = value.split('v=')[1];
      setFormData(prev => ({ ...prev, videoId }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.link && !formData.embedCode) {
      onError && onError(t('linkOrEmbedCodeRequired'));
      return;
    }
    try {
      if (videoId) {
        await updateVideo(videoId, formData);
        onSuccess && onSuccess(t('videoUpdatedSuccessfully'));
      } else {
        await createVideo(formData);
        onSuccess && onSuccess(t('videoCreatedSuccessfully'));
      }
      setFormData({
        title: '',
        link: '',
        videoId: '',
        provider: 'youtube',
        embedCode: ''
      });
    } catch (err) {
      console.error('Error saving video:', err);
      onError && onError(t('errorSavingVideo'));
    }
  };

  return (
    <Paper sx={{ p: 2 }}>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              label={t('Title')}
              name="title"
              value={formData.title}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label={t('Link')}
              name="link"
              value={formData.link}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label={t('Video ID')}
              name="videoId"
              value={formData.videoId}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label={t('Provider')}
              name="provider"
              value={formData.provider}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label={t('Embed Code')}
              name="embedCode"
              value={formData.embedCode}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <Button type="submit" variant="contained" color="primary">
              {videoId ? t('Update Video') : t('Create Video')}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default VideoForm;