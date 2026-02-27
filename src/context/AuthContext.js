import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import instance from '../axiosConfig';
import { removeTokens } from '../services/authService';
import config from '../config';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('accessToken'));
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // Yükleme durumu

    const checkAuth = useCallback(async () => {
        setLoading(true);
        const token = localStorage.getItem('accessToken');

        if (!token) {
            setIsLoggedIn(false);
            setUser(null);
            setLoading(false);
            return false;
        }

        try {
            const response = await instance.get('/api/users/profile');
            setIsLoggedIn(true);
            setUser(response.data);
            return true;
        } catch (error) {
            removeTokens();
            setIsLoggedIn(false);
            setUser(null);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const logout = async () => {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
            try {
                await axios.post(`${config.baseURL}api/users/logout`, { refreshToken });
            } catch (error) {
                // Logout endpoint is best-effort.
            }
        }
        removeTokens();
        setIsLoggedIn(false);
        setUser(null);
    };

    // Kullanıcının gerekli izne sahip olup olmadığını kontrol eden fonksiyon
    const hasPermission = useCallback((requiredPermission) => {
        if (!requiredPermission) return true;
        if (user?.role?.isSuperAdmin) return true;
        if (Array.isArray(requiredPermission)) {
            return requiredPermission.some((perm) => user?.role?.permissions?.includes(perm));
        }
        return user?.role?.permissions?.includes(requiredPermission);
    }, [user?.role?.isSuperAdmin, user?.role?.permissions]);

    return (
        <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, user, setUser, logout, loading, hasPermission, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
