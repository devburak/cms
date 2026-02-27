import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import Layout from './layout';

const ProtectedRoute = ({ children }) => {
    const { isLoggedIn, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress />
            </Box>
        );
    }

    return isLoggedIn ? <Layout><Outlet /></Layout> : <Navigate to="/login" state={{ from: location }} />;
};

export default ProtectedRoute;
