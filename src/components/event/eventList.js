import React, { useState, useEffect } from 'react';
import { fetchEvents, deleteEvent } from '../../api';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, TextField, Button, Select, MenuItem, Container, Typography, Pagination } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const EventList = () => {
    const { t } = useTranslation();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filter, setFilter] = useState({
        eventType: '',
        startDate: '',
        endDate: '',
        title: '',
    });

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

    useEffect(() => {
        fetchEventData();
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

    const handleDelete = async (eventId) => {
        if (window.confirm(t('Are you sure you want to delete this event?'))) {
            try {
                await deleteEvent(eventId);
                fetchEventData();
            } catch (error) {
                setError(t('Failed to delete event'));
            }
        }
    };

    const handleEdit = (eventId) => {
        navigate(`/event/${eventId}`);
    };

    if (loading) return <Typography>{t('Loading')}...</Typography>;
    if (error) return <Typography color="error">{error}</Typography>;

    return (
        <Container>
            <Typography variant="h4" gutterBottom>
                {t('Event List')}
            </Typography>

            {/* Filter Section */}
            <Paper sx={{ padding: 2, marginBottom: 2 }}>
                <TextField
                    label={t('Title')}
                    name="title"
                    value={filter.title}
                    onChange={handleFilterChange}
                    variant="outlined"
                    size="small"
                    sx={{ marginRight: 2 }}
                />
                <TextField
                    label={t('Start Date')}
                    name="startDate"
                    type="date"
                    value={filter.startDate}
                    onChange={handleFilterChange}
                    variant="outlined"
                    size="small"
                    sx={{ marginRight: 2 }}
                    InputLabelProps={{ shrink: true }}
                />
                <TextField
                    label={t('End Date')}
                    name="endDate"
                    type="date"
                    value={filter.endDate}
                    onChange={handleFilterChange}
                    variant="outlined"
                    size="small"
                    sx={{ marginRight: 2 }}
                    InputLabelProps={{ shrink: true }}
                />
                <Select
                    name="eventType"
                    value={filter.eventType}
                    onChange={handleFilterChange}
                    variant="outlined"
                    size="small"
                    displayEmpty
                    sx={{ marginRight: 2, minWidth: 150 }}
                >
                    <MenuItem value="">{t('All Types')}</MenuItem>
                    <MenuItem value="type1">{t('Type 1')}</MenuItem>
                    <MenuItem value="type2">{t('Type 2')}</MenuItem>
                </Select>
                <Button variant="contained" onClick={fetchEventData}>
                    {t('Apply Filters')}
                </Button>
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
                                    <TableCell>{event.title.length > 50 ? `${event.title.slice(0, 50)}...` : event.title}</TableCell>
                                    <TableCell>{event.spot.length > 50 ? `${event.spot.slice(0, 50)}...` : event.spot}</TableCell>
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
        </Container>
    );
};

export default EventList;
