import React, { useState, useEffect, useCallback } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Chip,
    CircularProgress,
    Box
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { getMyLogs } from '../../api';
import moment from 'moment';

const ActivityLogsTab = () => {
    const { t } = useTranslation();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchLogs = useCallback(async () => {
        try {
            setLoading(true);
            // Filter by LOGIN action and sort recent first
            const response = await getMyLogs({
                action: 'LOGIN',
                sortField: 'createdAt',
                sortOrder: 'desc',
                limit: 10
            });
            setLogs(response.logs || response); // Handle pagination response or array
        } catch (err) {
            console.error('Error fetching logs:', err);
            setError(t('failedToLoadLogs') || 'Failed to load logs');
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    if (loading) {
        return <Box display="flex" justifyContent="center" p={3}><CircularProgress /></Box>;
    }

    if (error) {
        return <Typography color="error">{error}</Typography>;
    }

    return (
        <React.Fragment>
            <Typography variant="h6" gutterBottom>
                {t('User Logs')}
            </Typography>
            <TableContainer component={Paper} elevation={0} variant="outlined">
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>{t('Date/Time')}</TableCell>
                            <TableCell>{t('IP Address')}</TableCell>
                            <TableCell>{t('Browser/OS')}</TableCell>
                            <TableCell>{t('Status')}</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {logs.length > 0 ? (
                            logs.map((log) => (
                                <TableRow key={log._id}>
                                    <TableCell>
                                        {moment(log.createdAt).format('DD.MM.YYYY HH:mm')}
                                    </TableCell>
                                    <TableCell>{log.ip || '-'}</TableCell>
                                    <TableCell>
                                        {/* Parse User Agent if possible or show simplified */}
                                        <Typography variant="body2" noWrap sx={{ maxWidth: 200 }} title={log.userAgent}>
                                            {log.userAgent || '-'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={log.statusCode === 200 || !log.statusCode ? 'Success' : 'Failed'}
                                            color={log.statusCode === 200 || !log.statusCode ? 'success' : 'error'}
                                            size="small"
                                        />
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} align="center">
                                    {t('No logs found')}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </React.Fragment>
    );
};

export default ActivityLogsTab;
