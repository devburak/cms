import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import { isLoggedIn } from '../services/authService';

const ProtectedRoute = (props) => {
  if (!isLoggedIn()) {
    return <Navigate to="/login" />;
  }

  return <Route {...props} />;
};

export default ProtectedRoute;
