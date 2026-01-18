import React, { useState, useEffect, useCallback } from 'react';
import { Container, Grid, Typography, Box, Alert, Skeleton } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSystem } from '../context/SystemContext';
import { getDashboardStats, getRecentContent, getRecentUsers } from '../api';
import SystemHealthCards from '../components/dashboard/SystemHealthCards';
import ContentStatsCards from '../components/dashboard/ContentStatsCards';
import RecentActivity from '../components/dashboard/RecentActivity';
import QuickActions from '../components/dashboard/QuickActions';

const DashboardPage = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const { systemInfo, refreshSystemInfo } = useSystem();

    const [stats, setStats] = useState(null);
    const [recentContent, setRecentContent] = useState([]);
    const [recentUsers, setRecentUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const isSuperAdmin = user?.role?.isSuperAdmin === true;

    const fetchData = useCallback(async () => {
        try {
            const [statsData, contentData] = await Promise.all([
                getDashboardStats(),
                getRecentContent()
            ]);

            setStats(statsData);
            setRecentContent(contentData);

            if (isSuperAdmin) {
                const usersData = await getRecentUsers();
                setRecentUsers(usersData);
            }

            // Refresh system info when dashboard refreshes
            if (refreshSystemInfo) refreshSystemInfo();

            setError(null);
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            // Don't show error on first load if it fails silently later (auto-refresh)
            if (loading) {
                setError(t('Failed to load dashboard data'));
            }
        } finally {
            setLoading(false);
        }
    }, [isSuperAdmin, t, loading, refreshSystemInfo]);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000); // 30 seconds
        return () => clearInterval(interval);
    }, [fetchData]);

    if (loading && !stats) {
        return (
            <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
                <Typography variant="h4" gutterBottom component="div">
                    <Skeleton width={200} />
                </Typography>
                <Grid container spacing={3}>
                    {[1, 2, 3, 4].map((item) => (
                        <Grid item xs={12} sm={6} md={3} key={item}>
                            <Skeleton variant="rectangular" height={140} />
                        </Grid>
                    ))}
                </Grid>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h4" component="h1">
                    {t('Dashboard')}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                    {t('Welcome back')},
                    <Link to="/profile" style={{ textDecoration: 'none', color: 'inherit', marginLeft: '4px' }}>
                        <strong>{user?.name || user?.username}</strong>
                    </Link>
                </Typography>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 4 }}>
                    {error}
                </Alert>
            )}

            {/* Phase 1: System Health & Content Stats */}
            {isSuperAdmin && systemInfo && <SystemHealthCards systemInfo={systemInfo} />}

            <ContentStatsCards stats={stats} />

            {/* Phase 2: Recent Activity & Quick Actions */}
            <Grid container spacing={3}>
                <Grid item xs={12} md={8} lg={9}>
                    <RecentActivity
                        recentContent={recentContent}
                        recentUsers={recentUsers}
                        recentErrors={systemInfo?.recentErrors || []}
                        user={user}
                    />
                </Grid>
                <Grid item xs={12} md={4} lg={3}>
                    <QuickActions />
                </Grid>
            </Grid>
        </Container>
    );
};

export default DashboardPage;
