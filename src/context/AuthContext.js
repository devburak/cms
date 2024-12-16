import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('accessToken'));
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // Yükleme durumu

    useEffect(() => {
        const checkAuthentication = async () => {
            setLoading(true);
            const token = localStorage.getItem('accessToken');
            if (token) {
                try {
                    const response = await axios.get(`${config.baseURL}api/users/profile`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    setIsLoggedIn(true);
                    console.log(response.data)
                    setUser(response.data);
                } catch (error) {
                    console.error("Authentication check failed:", error);
                    setIsLoggedIn(false);
                    setUser(null);
                }
            } else {
                setIsLoggedIn(false);
                setUser(null);
            }
            setLoading(false);
        };
        checkAuthentication();
    }, []);

    const logout = () => {
        localStorage.removeItem('accessToken');
        setIsLoggedIn(false);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, user, setUser, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
