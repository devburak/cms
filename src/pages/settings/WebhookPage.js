import React, { useState, useEffect } from 'react';
import {
    Container, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Button, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    Switch, FormControlLabel, Chip, Alert, Box, Stack, Tabs, Tab
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import {
    getWebhooks, createWebhook, updateWebhook, deleteWebhook, regenerateWebhookSecret,
    getWebhookJobs, retryWebhookJob, cleanupWebhookJobs
} from '../../api';

const WebhookPage = () => {
    const { t } = useTranslation();
    const [tabValue, setTabValue] = useState(0);

    // Endpoints State
    const [webhooks, setWebhooks] = useState([]);
    const [open, setOpen] = useState(false);
    const [currentWebhook, setCurrentWebhook] = useState(null);
    const [formData, setFormData] = useState({ name: '', url: '', events: [], isActive: true });
    const [secretDialog, setSecretDialog] = useState({ open: false, secret: '' });

    // Jobs State
    const [jobs, setJobs] = useState([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Define available events
    const AVAILABLE_EVENTS = [
        'content.created', 'content.updated', 'content.deleted',
        'form.created', 'form.updated', 'form.deleted', 'form.submitted',
        'event.created', 'event.updated', 'event.deleted',
        'file.uploaded', 'file.deleted'
    ];

    useEffect(() => {
        if (tabValue === 0) fetchWebhooks();
        if (tabValue === 1) fetchJobs();
    }, [tabValue]);

    const fetchWebhooks = async () => {
        setLoading(true);
        try {
            const data = await getWebhooks();
            setWebhooks(data);
        } catch (err) {
            setError(t('Failed to fetch webhooks'));
        } finally {
            setLoading(false);
        }
    };

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const data = await getWebhookJobs();
            setJobs(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
            setJobs([]);
        } finally {
            setLoading(false);
        }
    };

    const handleRetryJob = async (id) => {
        try {
            await retryWebhookJob(id);
            fetchJobs();
        } catch (err) {
            setError('Retry failed');
        }
    };

    const handleCleanupJobs = async () => {
        if (window.confirm(t('Are you sure you want to delete all failed jobs?'))) {
            try {
                await cleanupWebhookJobs();
                fetchJobs();
            } catch (err) {
                setError('Cleanup failed');
            }
        }
    };

    const handleOpen = (webhook = null) => {
        if (webhook) {
            setCurrentWebhook(webhook);
            setFormData({
                name: webhook.name,
                url: webhook.url,
                events: webhook.events.includes('*') ? AVAILABLE_EVENTS : webhook.events,
                isActive: webhook.isActive
            });
        } else {
            setCurrentWebhook(null);
            setFormData({ name: '', url: '', events: [], isActive: true });
        }
        setOpen(true);
    };

    const handleEventToggle = (event) => {
        let newEvents;
        if (event === '*') {
            // Toggle All
            if (formData.events.length === AVAILABLE_EVENTS.length) {
                newEvents = [];
            } else {
                newEvents = [...AVAILABLE_EVENTS];
            }
        } else {
            if (formData.events.includes(event)) {
                newEvents = formData.events.filter(e => e !== event);
            } else {
                newEvents = [...formData.events, event];
            }
        }
        setFormData({ ...formData, events: newEvents });
    };

    const handleClose = () => {
        setOpen(false);
        setCurrentWebhook(null);
    };

    const handleSubmit = async () => {
        try {
            let finalEvents = formData.events;
            if (formData.events.length === AVAILABLE_EVENTS.length) {
                finalEvents = ['*'];
            }

            const payload = {
                ...formData,
                events: finalEvents
            };

            if (currentWebhook) {
                await updateWebhook(currentWebhook._id, payload);
            } else {
                const res = await createWebhook(payload);
                setSecretDialog({ open: true, secret: res.secret });
            }
            fetchWebhooks();
            handleClose();
        } catch (err) {
            setError(t('Operation failed'));
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm(t('Are you sure?'))) {
            try {
                await deleteWebhook(id);
                fetchWebhooks();
            } catch (err) {
                setError(t('Delete failed'));
            }
        }
    };

    const handleRegenerateSecret = async (id) => {
        if (window.confirm(t('This will invalidate the old secret. Continue?'))) {
            try {
                const res = await regenerateWebhookSecret(id);
                setSecretDialog({ open: true, secret: res.secret });
            } catch (err) {
                setError(t('Failed to regenerate secret'));
            }
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="h4">{t('Webhook Settings')}</Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
                    <Tab label={t('Endpoints')} />
                    <Tab label={t('Logs & Queue')} />
                </Tabs>
            </Box>

            {/* TAB 0: ENDPOINTS */}
            {tabValue === 0 && (
                <>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()} sx={{ mb: 2 }}>
                        {t('Add Webhook')}
                    </Button>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>{t('Name')}</TableCell>
                                    <TableCell>{t('URL')}</TableCell>
                                    <TableCell>{t('Events')}</TableCell>
                                    <TableCell>{t('Status')}</TableCell>
                                    <TableCell align="right">{t('Actions')}</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {webhooks.map((webhook) => (
                                    <TableRow key={webhook._id}>
                                        <TableCell>{webhook.name}</TableCell>
                                        <TableCell>{webhook.url}</TableCell>
                                        <TableCell>
                                            {webhook.events.map(e => <Chip key={e} label={e} size="small" sx={{ mr: 0.5 }} />)}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={webhook.isActive ? t('Active') : t('Inactive')}
                                                color={webhook.isActive ? 'success' : 'default'}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            <IconButton onClick={() => handleRegenerateSecret(webhook._id)} title={t('Regenerate Secret')}>
                                                <RefreshIcon />
                                            </IconButton>
                                            <IconButton onClick={() => handleOpen(webhook)}>
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton onClick={() => handleDelete(webhook._id)}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </>
            )}

            {/* TAB 1: LOGS */}
            {tabValue === 1 && (
                <>
                    <Box display="flex" justifyContent="flex-end" mb={2}>
                        <Button color="error" variant="outlined" startIcon={<DeleteIcon />} onClick={handleCleanupJobs} sx={{ mr: 1 }}>
                            {t('Clean Failed Jobs')}
                        </Button>
                        <Button startIcon={<RefreshIcon />} onClick={fetchJobs}>
                            {t('Refresh')}
                        </Button>
                    </Box>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>{t('Time')}</TableCell>
                                    <TableCell>{t('Event')}</TableCell>
                                    <TableCell>{t('Status')}</TableCell>
                                    <TableCell>{t('Attempts')}</TableCell>
                                    <TableCell>{t('Last Error')}</TableCell>
                                    <TableCell align="right">{t('Actions')}</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {jobs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">{t('No pending or failed jobs')}</TableCell>
                                    </TableRow>
                                ) : (
                                    jobs.map((job) => (
                                        <TableRow key={job._id}>
                                            <TableCell>{new Date(job.createdAt).toLocaleString()}</TableCell>
                                            <TableCell>{job.event}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={job.status}
                                                    color={job.status === 'failed' ? 'error' : 'warning'}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>{job.attempts}</TableCell>
                                            <TableCell sx={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {job.lastError || '-'}
                                            </TableCell>
                                            <TableCell align="right">
                                                <Button size="small" onClick={() => handleRetryJob(job._id)}>
                                                    {t('Retry')}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </>
            )}


            {/* Create/Edit Dialog */}
            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>{currentWebhook ? t('Edit Webhook') : t('New Webhook')}</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField
                            label={t('Name')}
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            fullWidth
                        />
                        <TextField
                            label={t('URL')}
                            value={formData.url}
                            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                            fullWidth
                        />

                        <Box sx={{ border: '1px solid #ccc', borderRadius: 1, p: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>{t('Events')}</Typography>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={formData.events.length === AVAILABLE_EVENTS.length}
                                        onChange={() => handleEventToggle('*')}
                                    />
                                }
                                label={t('Select All / (*) All Events')}
                            />
                            <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                                {AVAILABLE_EVENTS.map(event => (
                                    <FormControlLabel
                                        key={event}
                                        control={
                                            <Switch
                                                size="small"
                                                checked={formData.events.includes(event)}
                                                onChange={() => handleEventToggle(event)}
                                            />
                                        }
                                        label={event}
                                        sx={{ mr: 2 }}
                                    />
                                ))}
                            </Box>
                        </Box>

                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                />
                            }
                            label={t('Active')}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>{t('Cancel')}</Button>
                    <Button onClick={handleSubmit} variant="contained">{t('Save')}</Button>
                </DialogActions>
            </Dialog>

            {/* Secret Display Dialog */}
            <Dialog open={secretDialog.open} onClose={() => setSecretDialog({ ...secretDialog, open: false })}>
                <DialogTitle>{t('Webhook Secret')}</DialogTitle>
                <DialogContent>
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        {t('Copy this secret now. It will not be shown again.')}
                    </Alert>
                    <Typography variant="body1" sx={{ fontFamily: 'monospace', bgcolor: '#f5f5f5', p: 2, borderRadius: 1, wordBreak: 'break-all' }}>
                        {secretDialog.secret}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSecretDialog({ ...secretDialog, open: false })}>{t('Close')}</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default WebhookPage;
