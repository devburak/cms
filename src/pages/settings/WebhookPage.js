import React, { useState, useEffect } from 'react';
import {
    Container, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Button, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    Switch, FormControlLabel, Chip, Alert, Box, Stack
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Refresh as RefreshIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { getWebhooks, createWebhook, updateWebhook, deleteWebhook, regenerateWebhookSecret } from '../../api';

const WebhookPage = () => {
    const { t } = useTranslation();
    const [webhooks, setWebhooks] = useState([]);
    const [open, setOpen] = useState(false);
    const [currentWebhook, setCurrentWebhook] = useState(null);
    const [formData, setFormData] = useState({ name: '', url: '', events: [], isActive: true });
    const [secretDialog, setSecretDialog] = useState({ open: false, secret: '' });
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
        fetchWebhooks();
    }, []);

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
            // Check if all events selected, if so send '*'
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
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">{t('Webhook Settings')}</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
                    {t('Add Webhook')}
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

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
