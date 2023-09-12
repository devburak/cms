import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('accessToken'));
    const [user, setUser] = useState(null);
    useEffect(() => {
        let isMounted = true; 
        const checkAuthentication = async () => {
            const token = localStorage.getItem('accessToken');
            if (token) {
                try {
                    const response = await axios.get(`${config.baseURL}api/user/isAuthenticated`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    if (isMounted && response.data) { // Sadece bileşen mount edildiyse state güncellemesi yap
                        if (response.data.user.isAuthenticated) {
                            setIsLoggedIn(true);
                            setUser(response.data.user)
                        } else {
                            setIsLoggedIn(false);
                            setUser(null)
                        }
                    }
                } catch (error) {
                    console.error("Authentication check failed:", error);
                    setIsLoggedIn(false);
                    setUser(null)
                }
            }
        };

        checkAuthentication();
        return () => {
            isMounted = false; // Cleanup fonksiyonunda bileşenin unmount edildiğini belirt
        };
    }, []);

    return (
        <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, user, setUser}}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
