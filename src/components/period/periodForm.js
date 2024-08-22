import React, { useState, useEffect } from 'react';
import { TextField, Button, Grid, Paper } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';
import 'moment/locale/tr'; // Türkçe yerel ayarı yükleyin
import { createPeriod, updatePeriod } from '../../api';

moment.locale('tr'); // Moment için Türkçe yerel ayarını kullan

const PeriodForm = ({ selectedPeriod, onSave, onCancel }) => {
    const [name, setName] = useState('');
    const [startDate, setStartDate] = useState(moment()); // Başlangıç için moment nesnesi
    const [endDate, setEndDate] = useState(moment()); // Başlangıç için moment nesnesi

    useEffect(() => {
        if (selectedPeriod) {
            setName(selectedPeriod.name);
            setStartDate(selectedPeriod.startDate ? moment(selectedPeriod.startDate) : moment()); // Null kontrolü
            setEndDate(selectedPeriod.endDate ? moment(selectedPeriod.endDate) : moment()); // Null kontrolü
        }
    }, [selectedPeriod]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const periodData = { 
            name, 
            startDate: startDate.toISOString(), // ISO string formatında kaydet
            endDate: endDate.toISOString() // ISO string formatında kaydet
        };

        try {
            if (selectedPeriod) {
                await updatePeriod(selectedPeriod._id, periodData);
            } else {
                await createPeriod(periodData);
            }
            onSave();
        } catch (error) {
            console.error("Failed to save period:", error);
        }
    };

    return (
        <Paper style={{ padding: '16px' }}>
            <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TextField
                            label="Period Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            fullWidth
                            required
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale="tr">
                            <DatePicker
                                label="Start Date"
                                value={startDate} // Moment nesnesi olmalı
                                onChange={(date) => setStartDate(date)}
                                renderInput={(props) => <TextField {...props} fullWidth required />}
                            />
                        </LocalizationProvider>
                    </Grid>
                    <Grid item xs={6}>
                        <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale="tr">
                            <DatePicker
                                label="End Date"
                                value={endDate} // Moment nesnesi olmalı
                                onChange={(date) => setEndDate(date)}
                                renderInput={(props) => <TextField {...props} fullWidth required />}
                            />
                        </LocalizationProvider>
                    </Grid>
                    <Grid item xs={12}>
                        <Button type="submit" variant="contained" color="primary" fullWidth>
                            {selectedPeriod ? 'Update Period' : 'Create Period'}
                        </Button>
                    </Grid>
                    {onCancel && (
                        <Grid item xs={12}>
                            <Button variant="outlined" onClick={onCancel} fullWidth>
                                Cancel
                            </Button>
                        </Grid>
                    )}
                </Grid>
            </form>
        </Paper>
    );
};

export default PeriodForm;
