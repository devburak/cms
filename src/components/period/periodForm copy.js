import React, { useState, useEffect } from 'react';
import { Grid, TextField, Button, Divider } from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';
import 'moment/locale/tr';

const PeriodForm = ({ selectedPeriod, onSave }) => {
  const [period, setPeriod] = useState({
    name: '',
    startDate: moment(),
    endDate: null,
    description: '',
  });

  useEffect(() => {
    if (selectedPeriod) {
      setPeriod({
        ...selectedPeriod,
        startDate: moment(selectedPeriod.startDate),
        endDate: selectedPeriod.endDate ? moment(selectedPeriod.endDate) : null,
      });
    }
  }, [selectedPeriod]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPeriod((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (name, newValue) => {
    setPeriod((prev) => ({ ...prev, [name]: newValue }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...period,
      startDate: period.startDate ? period.startDate.toISOString() : null,
      endDate: period.endDate ? period.endDate.toISOString() : null,
    });
    setPeriod({
        name: '',
        startDate: moment(),
        endDate: null,
        description: '',
      })
  };

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              required
              size='small'
              fullWidth
              name="name"
              label="Dönem Adı"
              value={period.name}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={6}>
          <DatePicker
              label="Başlangıç Tarihi"
              value={period.startDate}
              onChange={(newValue) => handleDateChange('startDate', newValue)}
              textField={<TextField fullWidth size='small' required />}
            />
          </Grid>
          <Grid item xs={6}>
          <DatePicker
              label="Bitiş Tarihi"
              value={period.endDate}
              onChange={(newValue) => handleDateChange('endDate', newValue)}
              textField={<TextField fullWidth size='small' />}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              size='small'
              fullWidth
              name="description"
              label="Açıklama"
              value={period.description}
              onChange={handleChange}
              multiline
              rows={2}
            />
          </Grid>
          <Grid item xs={12}>
            <Button fullWidth type="submit" variant="contained" color="primary">
              {selectedPeriod ? 'Güncelle' : 'Oluştur'}
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Divider />
          </Grid>
        </Grid>
      </form>
    </LocalizationProvider>
  );
};

export default PeriodForm;
