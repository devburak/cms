import React from 'react';
import { Grid, Card, CardContent, Typography, Box, Avatar } from '@mui/material';
import { useTranslation } from 'react-i18next';
import ArticleIcon from '@mui/icons-material/Article';
import FolderIcon from '@mui/icons-material/Folder';
import EventIcon from '@mui/icons-material/Event';
import ListAltIcon from '@mui/icons-material/ListAlt';

const StatCard = ({ title, value, icon, color, subtext }) => (
    <Card sx={{ height: '100%' }}>
        <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                    <Typography color="textSecondary" gutterBottom variant="subtitle2">
                        {title}
                    </Typography>
                    <Typography variant="h4" component="div">
                        {value}
                    </Typography>
                </Box>
                <Avatar sx={{ bgcolor: `${color}.light`, color: `${color}.main` }}>
                    {icon}
                </Avatar>
            </Box>
            {subtext && (
                <Box mt={2}>
                    <Typography variant="body2" color="textSecondary">
                        {subtext}
                    </Typography>
                </Box>
            )}
        </CardContent>
    </Card>
);

const ContentStatsCards = ({ stats }) => {
    const { t } = useTranslation();

    if (!stats) return null;

    const { content, files, events, forms } = stats;

    return (
        <Grid container spacing={3} mb={4}>
            {/* Content Stats */}
            <Grid item xs={12} sm={6} md={3}>
                <StatCard
                    title={t('Total Content')}
                    value={content.total}
                    icon={<ArticleIcon />}
                    color="primary"
                    subtext={`${content.published} ${t('Published')} • ${content.draft} ${t('Draft')}`}
                />
            </Grid>

            {/* File Stats */}
            <Grid item xs={12} sm={6} md={3}>
                <StatCard
                    title={t('Files')}
                    value={files.total}
                    icon={<FolderIcon />}
                    color="secondary"
                    subtext={`${t('Total Size')}: ${files.totalSizeFormatted}`}
                />
            </Grid>

            {/* Event Stats */}
            <Grid item xs={12} sm={6} md={3}>
                <StatCard
                    title={t('Events')}
                    value={events.total}
                    icon={<EventIcon />}
                    color="info"
                    subtext={`${events.upcoming} ${t('Upcoming')} • ${events.active} ${t('Active')}`}
                />
            </Grid>

            {/* Form Stats */}
            <Grid item xs={12} sm={6} md={3}>
                <StatCard
                    title={t('Forms')}
                    value={forms.total}
                    icon={<ListAltIcon />}
                    color="warning"
                    subtext={`${forms.totalSubmissions} ${t('Submissions')} (${forms.recentSubmissions} ${t('Recent')})`}
                />
            </Grid>
        </Grid>
    );
};

export default ContentStatsCards;
