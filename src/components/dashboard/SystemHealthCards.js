import React from 'react';
import { Grid, Card, CardContent, Typography, Box, CircularProgress, Chip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import ComputerIcon from '@mui/icons-material/Computer';
import MemoryIcon from '@mui/icons-material/Memory';
import StorageIcon from '@mui/icons-material/Storage';
import SpeedIcon from '@mui/icons-material/Speed';

const SystemHealthCards = ({ systemInfo }) => {
    const { t } = useTranslation();

    if (!systemInfo) return null;

    const { health, uptime, memory, database, cpu } = systemInfo;

    const getHealthColor = (status) => {
        switch (status) {
            case 'healthy': return 'success';
            case 'warning': return 'warning';
            case 'critical': return 'error';
            default: return 'default';
        }
    };

    return (
        <Grid container spacing={3} mb={4}>
            {/* Server Status */}
            <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ height: '100%' }}>
                    <CardContent>
                        <Box display="flex" alignItems="center" mb={2}>
                            <ComputerIcon color="primary" sx={{ mr: 1 }} />
                            <Typography variant="h6">{t('Server Status')}</Typography>
                        </Box>
                        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                            <Typography variant="body2" color="textSecondary">{t('Status')}</Typography>
                            <Chip
                                label={t(health.status.toUpperCase())}
                                color={getHealthColor(health.status)}
                                size="small"
                            />
                        </Box>
                        <Typography variant="body2" color="textSecondary">{t('Uptime')}:</Typography>
                        <Typography variant="body1" fontWeight="bold">{uptime.process}</Typography>
                    </CardContent>
                </Card>
            </Grid>

            {/* Memory Usage */}
            <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ height: '100%' }}>
                    <CardContent>
                        <Box display="flex" alignItems="center" mb={2}>
                            <MemoryIcon color="secondary" sx={{ mr: 1 }} />
                            <Typography variant="h6">{t('Memory')}</Typography>
                        </Box>
                        <Box display="flex" alignItems="center" justifyContent="center" position="relative">
                            <CircularProgress
                                variant="determinate"
                                value={memory.usagePercent}
                                color={memory.usagePercent > 90 ? 'error' : 'primary'}
                                size={80}
                            />
                            <Box
                                position="absolute"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                            >
                                <Typography variant="caption" component="div" color="textSecondary">
                                    {memory.usagePercent}%
                                </Typography>
                            </Box>
                        </Box>
                        <Box mt={2} textAlign="center">
                            <Typography variant="body2" color="textSecondary">
                                {memory.used} / {memory.total}
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>
            </Grid>

            {/* Database */}
            <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ height: '100%' }}>
                    <CardContent>
                        <Box display="flex" alignItems="center" mb={2}>
                            <StorageIcon color="info" sx={{ mr: 1 }} />
                            <Typography variant="h6">{t('Database')}</Typography>
                        </Box>
                        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                            <Typography variant="body2" color="textSecondary">{t('Connection')}</Typography>
                            <Chip
                                label={database.connected ? t('Connected') : t('Disconnected')}
                                color={database.connected ? 'success' : 'error'}
                                size="small"
                            />
                        </Box>
                        {database.stats && (
                            <>
                                <Typography variant="body2" color="textSecondary">{t('Data Size')}:</Typography>
                                <Typography variant="body1" fontWeight="bold">{database.stats.totalSize}</Typography>
                                <Typography variant="body2" color="textSecondary" mt={1}>{t('Collections')}:</Typography>
                                <Typography variant="body1" fontWeight="bold">{database.stats.collections}</Typography>
                            </>
                        )}
                    </CardContent>
                </Card>
            </Grid>

            {/* CPU */}
            <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ height: '100%' }}>
                    <CardContent>
                        <Box display="flex" alignItems="center" mb={2}>
                            <SpeedIcon color="warning" sx={{ mr: 1 }} />
                            <Typography variant="h6">{t('CPU')}</Typography>
                        </Box>
                        <Typography variant="body2" color="textSecondary" noWrap title={cpu.model}>
                            {cpu.model}
                        </Typography>
                        <Box mt={2}>
                            <Typography variant="body2" color="textSecondary">{t('Cores')}:</Typography>
                            <Typography variant="body1" fontWeight="bold">{cpu.cores}</Typography>
                        </Box>
                        <Box mt={1}>
                            <Typography variant="body2" color="textSecondary">{t('Load Avg')}:</Typography>
                            <Typography variant="body1" fontWeight="bold">
                                {cpu.loadAverage.map(l => l.toFixed(2)).join(', ')}
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
};

export default SystemHealthCards;
