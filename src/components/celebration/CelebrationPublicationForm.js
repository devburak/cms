import React, { useState, useEffect } from 'react';
import { TextField, Button, Grid, Paper, Autocomplete, Stack } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { createCelebrationPublication, updateCelebrationPublication, getCelebrationPublicationById, getAllPeriods } from '../../api';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import moment from 'moment';
import FeaturedImageUpload from '../file/featuredImage';
import 'moment/locale/tr';

const CelebrationPublicationForm = ({ initialValues, onSave, onCancel, periods = [] }) => {
  const [publication, setPublication] = useState({
    title: '',
    period: '',
    url: '',
    publishDate: moment(),
    featuredImage: null,
  });

  useEffect(() => {
    if (initialValues) {
      setPublication({
        ...initialValues,
        publishDate: initialValues.publishDate ? moment(initialValues.publishDate) : moment(),
        period: initialValues.period?._id || '', // Dönem ID'sini kullanarak set ediyoruz
        featuredImage: initialValues.image || null, // Resim varsa set ediyoruz
      });
    }
  }, [initialValues]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPublication({ 
      ...publication, 
      [name]: name === 'title' ? value.toLocaleUpperCase('tr-TR') : value 
    });
  };

  const handleDateChange = (date) => {
    setPublication({ ...publication, publishDate: date });
  };

  const handleImageChange = (image) => {
    setPublication({ ...publication, featuredImage: image });
  };

  const handleSave = () => {
    const publicationData = {
      ...publication,
      publishDate: publication.publishDate ? publication.publishDate.toISOString() : null,
    };
    onSave(publicationData);
  };

  return (
    <Paper style={{ padding: 16 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            label="Başlık"
            variant="outlined"
            fullWidth
            name="title"
            value={publication.title}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="URL"
            variant="outlined"
            fullWidth
            name="url"
            required
            value={publication.url}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12}>
          <Autocomplete
            options={periods}
            getOptionLabel={(option) => {
                const startDateFormatted = option.startDate ? new Date(option.startDate).toLocaleDateString('tr-TR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                }) : '';
                
                const endDateFormatted = option.endDate ? new Date(option.endDate).toLocaleDateString('tr-TR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                }) : '';
              
                return option?.name ? `${option.name} (${startDateFormatted} - ${endDateFormatted})` : '';
              }}
              
            onChange={(event, newValue) => setPublication({ ...publication, period: newValue ? newValue._id : '' })}
            value={periods?.find(p => p._id === publication.period) || null}
            isOptionEqualToValue={(option, value) => option._id === value._id}
            renderInput={(params) => <TextField {...params} label="Dönem Seç" variant="outlined" />}
            fullWidth
          />
        </Grid>
        <Grid item xs={12}>
        <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale="tr">
        <Stack spacing={3} sx={{ minWidth: "100%" }}>
          <DateTimePicker
            label="Yayınlanma Tarihi"
            value={publication.publishDate}
            onChange={handleDateChange}
            renderInput={(params) => <TextField {...params} fullWidth />}
          />
          </Stack>
         </LocalizationProvider>
        </Grid>
        <Grid item xs={12}>
          <FeaturedImageUpload 
            initialFile={publication.featuredImage} 
            handleFeaturedImage={handleImageChange} 
          />
        </Grid>
        <Grid item xs={12}>
          <Button variant="contained" color="primary" onClick={handleSave}>
            {initialValues ? 'Güncelle' : 'Kaydet'}
          </Button>
          <Button variant="outlined" color="secondary" onClick={onCancel} style={{ marginLeft: '10px' }}>
            İptal
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default CelebrationPublicationForm;
