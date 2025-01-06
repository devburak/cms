import React, { useState, useEffect } from 'react';
import { fetchEvents, deleteEvent, getAllEventTypes } from '../../api';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, TextField, Button, Container, Typography, Pagination, Autocomplete, Skeleton, Snackbar, Alert, Grid } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const EventList = () => {
    const { t } = useTranslation();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [eventTypes, setEventTypes] = useState([]);
    const [filter, setFilter] = useState({
        eventType: '',
        startDate: '',
        endDate: '',
        title: '',
    });

    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');

    const navigate = useNavigate();

    const fetchEventData = async () => {
        setLoading(true);
        try {
            const response = await fetchEvents(filter, page, 10);
            setEvents(response.events);
            setTotalPages(response.totalPages);
        } catch (error) {
            setError(t('Failed to fetch events'));
        } finally {
            setLoading(false);
        }
    };

    const fetchEventTypes = async () => {
        try {
            const types = await getAllEventTypes();
            setEventTypes([{ label: t('All Types'), value: '' }, ...types.map((type) => ({ label: type.name, value: type.name }))]);
        } catch (error) {
            console.error('Failed to fetch event types:', error);
        }
    };

    useEffect(() => {
        fetchEventData();
        fetchEventTypes();
    }, [page]);

    const handlePageChange = (event, value) => {
        setPage(value);
    };

    const handleFilterChange = (e) => {
        setFilter({
            ...filter,
            [e.target.name]: e.target.value,
        });
    };

    const handleEventTypeChange = (event, value) => {
        setFilter({
            ...filter,
            eventType: value?.value || '',
        });
    };

    const handleApplyFilters = () => {
        setPage(1); // Sayfayı başa döndür
        fetchEventData();
    };

    const handleDelete = async (eventId) => {
        if (window.confirm(t('Are you sure you want to delete this event?'))) {
            try {
                await deleteEvent(eventId);
                fetchEventData();
                setSnackbarMessage(t('Event deleted successfully'));
                setSnackbarSeverity('success');
                setSnackbarOpen(true);
            } catch (error) {
                setSnackbarMessage(t('Failed to delete event'));
                setSnackbarSeverity('error');
                setSnackbarOpen(true);
            }
        }
    };

    const handleEdit = (eventId) => {
        navigate(`/event/${eventId}`);
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    if (loading) {
        return (
            <Container>
                {/* <Typography variant="h4" gutterBottom>
                    {t('Event List')}
                </Typography> */}
                <Skeleton variant="rectangular" height={50} />
                <Skeleton variant="rectangular" height={50} sx={{ mt: 2 }} />
                <Skeleton variant="rectangular" height={50} sx={{ mt: 2 }} />
            </Container>
        );
    }

    if (error) return <Typography color="error">{error}</Typography>;

    return (
        <Container>
            {/* <Typography variant="h4" gutterBottom>
                {t('Event List')}
            </Typography> */}

            <Paper sx={{ padding: 2, marginBottom: 2 }}>
                <Grid container spacing={2} alignItems="center">
                    {/* Title Filter */}
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            label={t('Title')}
                            name="title"
                            value={filter.title}
                            onChange={handleFilterChange}
                            variant="outlined"
                            size="small"
                            fullWidth
                        />
                    </Grid>

                    {/* Start Date Filter */}
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            label={t('Start Date')}
                            name="startDate"
                            type="date"
                            value={filter.startDate}
                            onChange={handleFilterChange}
                            variant="outlined"
                            size="small"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>

                    {/* End Date Filter */}
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            label={t('End Date')}
                            name="endDate"
                            type="date"
                            value={filter.endDate}
                            onChange={handleFilterChange}
                            variant="outlined"
                            size="small"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>

                    {/* Event Type Filter */}
                    <Grid item xs={12} sm={6} md={3}>
                        <Autocomplete
                            options={eventTypes}
                            getOptionLabel={(option) => option.label}
                            onChange={handleEventTypeChange}
                            value={eventTypes.find((option) => option.value === filter.eventType) || eventTypes[0]}
                            renderInput={(params) => (
                                <TextField {...params} label={t('Event Type')} variant="outlined" size="small" fullWidth />
                            )}
                        />
                    </Grid>

                    {/* Apply Filters Button */}
                    <Grid item xs={12} >
                        <Button
                            variant="contained"
                            onClick={handleApplyFilters}
                            fullWidth
                            sx={{
                                height: { xs: 'auto', sm: '100%' }, // Mobilde otomatik, masaüstünde tam yüksekliği kaplar
                            }}
                        >
                            {t('Apply Filters')}
                        </Button>
                    </Grid>
                </Grid>
            </Paper>


            {/* Event List Table */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>{t('Title')}</TableCell>
                            <TableCell>{t('Spot')}</TableCell>
                            <TableCell>{t('Location')}</TableCell>
                            <TableCell>{t('Type')}</TableCell>
                            <TableCell>{t('Start Date')}</TableCell>
                            <TableCell>{t('End Date')}</TableCell>
                            <TableCell>{t('Actions')}</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {Array.isArray(events) && events.length > 0 ? (
                            events.map((event) => (
                                <TableRow key={event._id}>
                                    <TableCell>{event.title}</TableCell>
                                    <TableCell>{event.spot}</TableCell>
                                    <TableCell>{event.location}</TableCell>
                                    <TableCell>{event.eventType}</TableCell>
                                    <TableCell>{event.startDate}</TableCell>
                                    <TableCell>{event.endDate}</TableCell>
                                    <TableCell>
                                        <IconButton color="primary" onClick={() => handleEdit(event._id)}>
                                            <Edit />
                                        </IconButton>
                                        <IconButton color="secondary" onClick={() => handleDelete(event._id)}>
                                            <Delete />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} align="center">
                                    {t('No events found')}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Pagination */}
            <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                sx={{ marginTop: 2 }}
            />

            {/* Snackbar */}
            <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
                <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default EventList;
