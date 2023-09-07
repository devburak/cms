import React from 'react';
import { Outlet, Navigate,useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { isLoggedIn } = useAuth();
    const location = useLocation();
    console.log("location on ProtectedRoute: " , location)
    return isLoggedIn ? <Outlet /> : <Navigate to="/login"  state={{ from: location }}/>;
};

export default ProtectedRoute;
