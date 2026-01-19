import React, { useState, useEffect } from 'react';
import {
    Container, Typography, Paper, Box, Button,
    FormControl, InputLabel, Select, MenuItem, Alert, CircularProgress
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { useTranslation } from 'react-i18next';
import { getPeriods, getSystemVariable, setSystemVariable } from '../api';

const DefaultPeriodPage = () => {
    const { t } = useTranslation();
    const [periods, setPeriods] = useState([]);
    const [selectedPeriod, setSelectedPeriod] = useState('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch all periods (large limit to get all)
            const periodsData = await getPeriods(1, 100);
            setPeriods(periodsData.periods || []);

            // Fetch current default period
            try {
                const currentDefault = await getSystemVariable('yetmisDefaultPeriod');
                if (currentDefault && currentDefault.value) {
                    setSelectedPeriod(currentDefault.value);
                }
            } catch (err) {
                // If 404, just ignore, means not set yet
                if (err.response && err.response.status !== 404) {
                    console.error('Error fetching system variable:', err);
                }
            }
        } catch (err) {
            console.error('Error fetching data:', err);
            setMessage({ type: 'error', text: t('Failed to load data') });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!selectedPeriod) return;
        setSaving(true);
        setMessage({ type: '', text: '' });
        try {
            await setSystemVariable(
                'yetmisDefaultPeriod',
                selectedPeriod,
                'Default period for 70th Year Archive Project'
            );
            setMessage({ type: 'success', text: t('Default period updated successfully') });
        } catch (err) {
            console.error('Error saving:', err);
            setMessage({ type: 'error', text: t('Failed to save') });
        } finally {
            setSaving(false);
        }
    };

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Paper sx={{ p: 4 }}>
                <Typography variant="h5" gutterBottom>
                    {t('70. Yıl - Varsayılan Dönem Ayarı')}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                    {t('Bu ayar, 70. yıl arşiv sitesinde açılışta seçili gelecek olan varsayılan dönemi belirler.')}
                </Typography>

                {message.text && (
                    <Alert severity={message.type} sx={{ mb: 3 }}>
                        {message.text}
                    </Alert>
                )}

                {loading ? (
                    <Box display="flex" justifyContent="center" p={3}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Box component="form" noValidate autoComplete="off">
                        <FormControl fullWidth margin="normal">
                            <InputLabel id="period-select-label">{t('Varsayılan Dönem')}</InputLabel>
                            <Select
                                labelId="period-select-label"
                                value={selectedPeriod}
                                label={t('Varsayılan Dönem')}
                                onChange={(e) => setSelectedPeriod(e.target.value)}
                            >
                                <MenuItem value="">
                                    <em>{t('Seçiniz')}</em>
                                </MenuItem>
                                {periods.map((period) => (
                                    <MenuItem key={period._id} value={period._id}>
                                        {period.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Box mt={3} display="flex" justifyContent="flex-end">
                            <Button
                                variant="contained"
                                startIcon={<SaveIcon />}
                                onClick={handleSave}
                                disabled={saving || !selectedPeriod}
                            >
                                {saving ? t('Saving...') : t('Save')}
                            </Button>
                        </Box>
                    </Box>
                )}
            </Paper>
        </Container>
    );
};

export default DefaultPeriodPage;
