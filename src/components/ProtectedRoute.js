import React from 'react';
import { Outlet, Navigate,useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from './layout';
const ProtectedRoute = ({ children }) => {
    const { isLoggedIn } = useAuth();
    const location = useLocation();
    console.log("location on ProtectedRoute: " , location)
    return isLoggedIn ? <Layout><Outlet /> </Layout>: <Navigate to="/login"  state={{ from: location }}/>;
};

export default ProtectedRoute;
