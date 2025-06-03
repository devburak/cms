import React, { useState, useEffect } from 'react';
import {
  TextField, Button, MenuItem, InputLabel, FormControl, Select,
  Grid, Typography, Box, Paper, CircularProgress
} from '@mui/material';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import Autocomplete from '@mui/material/Autocomplete';
import moment from 'moment';
import 'moment/locale/tr';
import { createExpertise, updateExpertise, getExpertiseById, getAllChambers } from '../../api';

moment.locale('tr');

const ExpertiseForm = ({ expertiseId, onSaveSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    type: '',
    chamber: '',
    startDate: null,
    endDate: null,
    location: { address: '', googleMapsLink: '' },
    contact: { email: '', phone: '' },
    application: { link: '', email: '', description: '' },
  });
  const [chambers, setChambers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchChambers = async () => {
      try {
        const data = await getAllChambers();
        setChambers(Array.isArray(data) ? data : (data?.data || []));
      } catch (err) {
        setChambers([]);
      }
    };
    fetchChambers();
  }, []);

  useEffect(() => {
    if (expertiseId) {
      setIsEditing(true);
      setLoading(true);
      const fetchExpertise = async () => {
        try {
          const data = await getExpertiseById(expertiseId);
          setFormData({
            ...data,
            startDate: data.startDate ? moment(data.startDate) : null,
            endDate: data.endDate ? moment(data.endDate) : null,
            location: data.location || { address: '', googleMapsLink: '' },
            contact: data.contact || { email: '', phone: '' },
            application: data.application || { link: '', email: '', description: '' },
            chamber: data.chamber?._id || data.chamber || '',
          });
          setLoading(false);
        } catch (err) {
          setError('Failed to fetch expertise data.');
          setLoading(false);
        }
      };
      fetchExpertise();
    } else {
      setIsEditing(false);
      setFormData({
        type: '',
        chamber: '',
        startDate: null,
        endDate: null,
        location: { address: '', googleMapsLink: '' },
        contact: { email: '', phone: '' },
        application: { link: '', email: '', description: '' },
      });
    }
  }, [expertiseId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleNestedInputChange = (section, e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [section]: {
        ...formData[section],
        [name]: value,
      },
    });
  };

  const handleDateChange = (name, date) => {
    setFormData({ ...formData, [name]: date });
  };

  const handleChamberChange = (event, value) => {
    setFormData({ ...formData, chamber: value ? value._id : '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        startDate: formData.startDate ? formData.startDate.toISOString() : null,
        endDate: formData.endDate ? formData.endDate.toISOString() : null,
      };
      if (isEditing) {
        await updateExpertise(expertiseId, payload);
      } else {
        await createExpertise(payload);
      }
      onSaveSuccess();
      if (!isEditing) {
         setFormData({
            type: 'Temel Eğitim',
            chamber: '',
            startDate: null,
            endDate: null,
            location: { address: '', googleMapsLink: '' },
            contact: { email: '', phone: '' },
            application: { link: '', email: '', description: '' },
          });
      }
    } catch (err) {
      setError('Failed to save expertise.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale="tr">
      <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 1 }}>
          {isEditing ? 'Bilirkişilik Eğitimi Düzenle' : 'Yeni Bilirkişilik Eğitimi Ekle'}
        </Typography>
        {loading && !expertiseId && <CircularProgress size={20} />}
        {error && <Typography color="error">{error}</Typography>}
        <form onSubmit={handleSubmit}>
          <Grid container spacing={1.5}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small" required margin="dense">
                <InputLabel>Eğitim Türü</InputLabel>
                <Select
                  name="type"
                  value={formData.type}
                  label="Eğitim Türü"
                  onChange={handleInputChange}
                  size="small"
                  fullWidth
                  margin="dense"
                >
                  <MenuItem value="Temel Eğitim">Temel Eğitim</MenuItem>
                  <MenuItem value="Yenileme Eğitimi">Yenileme Eğitimi</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Autocomplete
                size="small"
                options={Array.isArray(chambers) ? chambers : []}
                getOptionLabel={(option) => option.name || ''}
                value={chambers.find(c => c._id === formData.chamber) || null}
                onChange={handleChamberChange}
                isOptionEqualToValue={(option, value) => option._id === value._id}
                renderInput={(params) => (
                  <TextField {...params} label="Oda" margin="dense" fullWidth size="small" required />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DateTimePicker
                label="Başlangıç Tarihi ve Saati"
                value={formData.startDate}
                onChange={(date) => handleDateChange('startDate', date)}
                ampm={false}
               slotProps={{ textField: { size: 'small' ,fullWidth: true} }}
                inputFormat="DD.MM.YYYY HH:mm"
                renderInput={(params) => <TextField {...params} fullWidth size="small" margin="dense" required />}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DateTimePicker
                label="Bitiş Tarihi ve Saati"
                value={formData.endDate}
               slotProps={{ textField: { size: 'small' ,fullWidth: true} }}
                onChange={(date) => handleDateChange('endDate', date)}
                ampm={false}
                inputFormat="DD.MM.YYYY HH:mm"
                renderInput={(params) => <TextField {...params} fullWidth size="small" margin="dense" required />}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mt: 1, mb: 0.5, fontSize: 14 }}>Konum Bilgileri</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Adres"
                name="address"
                value={formData.location.address}
                onChange={(e) => handleNestedInputChange('location', e)}
                fullWidth
                size="small"
                margin="dense"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Google Haritalar Linki"
                name="googleMapsLink"
                value={formData.location.googleMapsLink}
                onChange={(e) => handleNestedInputChange('location', e)}
                fullWidth
                size="small"
                margin="dense"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mt: 1, mb: 0.5, fontSize: 14 }}>İletişim Bilgileri</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="E-posta"
                name="email"
                type="email"
                value={formData.contact.email}
                onChange={(e) => handleNestedInputChange('contact', e)}
                fullWidth
                size="small"
                margin="dense"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Telefon"
                name="phone"
                value={formData.contact.phone}
                onChange={(e) => handleNestedInputChange('contact', e)}
                fullWidth
                size="small"
                margin="dense"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mt: 1, mb: 0.5, fontSize: 14 }}>Başvuru Bilgileri</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Başvuru Linki"
                name="link"
                value={formData.application.link}
                onChange={(e) => handleNestedInputChange('application', e)}
                fullWidth
                size="small"
                margin="dense"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Başvuru E-postası"
                name="email"
                type="email"
                value={formData.application.email}
                onChange={(e) => handleNestedInputChange('application', e)}
                fullWidth
                size="small"
                margin="dense"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Başvuru Açıklaması"
                name="description"
                value={formData.application.description}
                onChange={(e) => handleNestedInputChange('application', e)}
                fullWidth
                size="small"
                margin="dense"
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1 }}>
                <Button onClick={onCancel} variant="outlined" size="small">
                  İptal
                </Button>
                <Button type="submit" variant="contained" color="primary" size="small" disabled={loading}>
                  {loading ? <CircularProgress size={20} /> : (isEditing ? 'Güncelle' : 'Oluştur')}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </LocalizationProvider>
  );
};

export default ExpertiseForm;
