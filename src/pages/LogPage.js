import React, { useState, useEffect } from 'react';
import {
    Container,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Grid,
    Typography,
    Box,
    Chip,
    Button
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';
import 'moment/locale/tr';
import { getLogs, deleteOldLogs } from '../api';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

moment.locale('tr');

const LogPage = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [logs, setLogs] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(20);
    const [loading, setLoading] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // Filters
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [resourceFilter, setResourceFilter] = useState('');
    const [actionFilter, setActionFilter] = useState('');

    // Check if user is super admin
    const isSuperAdmin = user?.role?.isSuperAdmin === true;

    useEffect(() => {
        fetchLogs();
    }, [page, rowsPerPage, startDate, endDate, resourceFilter, actionFilter]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const params = {
                page: page + 1,
                limit: rowsPerPage,
                sortField: 'createdAt',
                sortOrder: 'desc'
            };

            // Add filters
            if (startDate) {
                const dateObj = startDate.toDate ? startDate.toDate() : startDate;
                if (dateObj instanceof Date && !isNaN(dateObj)) {
                    params.startDate = dateObj.toISOString();
                }
            }
            if (endDate) {
                const dateObj = endDate.toDate ? endDate.toDate() : endDate;
                if (dateObj instanceof Date && !isNaN(dateObj)) {
                    const endOfDay = new Date(dateObj);
                    endOfDay.setHours(23, 59, 59, 999);
                    params.endDate = endOfDay.toISOString();
                }
            }
            if (resourceFilter) {
                params.resource = resourceFilter;
            }
            if (actionFilter) {
                params.action = actionFilter;
            }

            const data = await getLogs(params);
            setLogs(data.logs || []);
            setTotal(data.totalLogs || 0);
        } catch (error) {
            console.error('Error fetching logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleClearFilters = () => {
        setStartDate(null);
        setEndDate(null);
        setResourceFilter('');
        setActionFilter('');
        setPage(0);
    };

    const formatDate = (date) => {
        return moment(date).format('DD.MM.YYYY HH:mm:ss');
    };

    const getActionColor = (action) => {
        if (action?.includes('CREATE')) return 'success';
        if (action?.includes('UPDATE')) return 'info';
        if (action?.includes('DELETE')) return 'error';
        if (action?.includes('LOGIN')) return 'primary';
        return 'default';
    };

    const handleDeleteOldLogs = async () => {
        if (!window.confirm(t('Delete logs older than 1 year?'))) {
            return;
        }

        setDeleting(true);
        try {
            const result = await deleteOldLogs(365);
            alert(t('Old logs deleted successfully') + ': ' + result.deletedCount + ' ' + t('logs'));
            fetchLogs(); // Refresh the list
        } catch (error) {
            console.error('Error deleting old logs:', error);
            alert(t('Error deleting old logs'));
        } finally {
            setDeleting(false);
        }
    };


    return (
        <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale="tr">
            <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
                <Typography variant="h4" gutterBottom>
                    {t('User Logs')}
                </Typography>

                {/* Filters */}
                <Paper sx={{ p: 2, mb: 3 }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={3}>
                            <DatePicker
                                label={t('Start Date')}
                                value={startDate}
                                onChange={setStartDate}
                                slotProps={{ textField: { size: 'small', fullWidth: true } }}
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <DatePicker
                                label={t('End Date')}
                                value={endDate}
                                onChange={setEndDate}
                                slotProps={{ textField: { size: 'small', fullWidth: true } }}
                            />
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <FormControl fullWidth size="small">
                                <InputLabel>{t('Resource Type')}</InputLabel>
                                <Select
                                    value={resourceFilter}
                                    label={t('Resource Type')}
                                    onChange={(e) => setResourceFilter(e.target.value)}
                                >
                                    <MenuItem value="">{t('All Resources')}</MenuItem>
                                    <MenuItem value="content">{t('content')}</MenuItem>
                                    <MenuItem value="file">{t('file')}</MenuItem>
                                    <MenuItem value="event">{t('event')}</MenuItem>
                                    <MenuItem value="form">{t('form')}</MenuItem>
                                    <MenuItem value="publication">{t('publication')}</MenuItem>
                                    <MenuItem value="user">{t('user')}</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <TextField
                                fullWidth
                                size="small"
                                label={t('Action')}
                                value={actionFilter}
                                onChange={(e) => setActionFilter(e.target.value)}
                                placeholder={t('Filter by Action')}
                            />
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <Button
                                fullWidth
                                variant="outlined"
                                onClick={handleClearFilters}
                            >
                                {t('Clear Filters')}
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Logs Table */}
                <Paper>
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>{t('Date/Time')}</TableCell>
                                    <TableCell>{t('User')}</TableCell>
                                    <TableCell>{t('Action')}</TableCell>
                                    <TableCell>{t('Resource')}</TableCell>
                                    <TableCell>{t('Details')}</TableCell>
                                    <TableCell>{t('IP Address')}</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">
                                            {t('Loading...')}
                                        </TableCell>
                                    </TableRow>
                                ) : logs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">
                                            {t('No logs found')}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    logs.map((log) => (
                                        <TableRow key={log._id} hover>
                                            <TableCell>{formatDate(log.createdAt)}</TableCell>
                                            <TableCell>
                                                {log.user?.username || log.user?.email || t('System')}
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={t(log.action)}
                                                    color={getActionColor(log.action)}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {log.resource ? t(log.resource) : '-'}
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
                                                    {log.details || '-'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="caption">{log.ip || '-'}</Typography>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        component="div"
                        count={total}
                        page={page}
                        onPageChange={handleChangePage}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        rowsPerPageOptions={[10, 20, 50, 100]}
                        labelRowsPerPage={t('Rows per page')}
                    />
                </Paper>

                {/* Summary and Actions */}
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                        {t('Showing')} {logs.length} {t('of')} {total} {t('logs')}
                    </Typography>

                    {isSuperAdmin && (
                        <Button
                            variant="contained"
                            color="error"
                            onClick={handleDeleteOldLogs}
                            disabled={deleting}
                        >
                            {deleting ? t('Deleting...') : t('Delete Logs Older Than 1 Year')}
                        </Button>
                    )}
                </Box>
            </Container>
        </LocalizationProvider>
    );
};

export default LogPage;
