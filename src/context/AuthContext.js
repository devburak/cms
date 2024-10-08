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
                    const response = await axios.get(`${config.baseURL}api/users/profile`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (isMounted && response.data) { // Sadece bileşen mount edildiyse state güncellemesi yap
                        setIsLoggedIn(true);
                        setUser(response.data);
                    }
                } catch (error) {
                    console.error("Authentication check failed:", error);
                    setIsLoggedIn(false);
                    setUser(null);
                }
            } else {
                setIsLoggedIn(false);
                setUser(null);
            }
        };

        checkAuthentication();
        return () => {
            isMounted = false; // Cleanup fonksiyonunda bileşenin unmount edildiğini belirt
        };
    }, []);

       // Logout function
       const logout = () => {
        localStorage.removeItem('accessToken');  // Remove token
        setIsLoggedIn(false);                   // Update state
        setUser(null);                          // Clear user state
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, user, setUser ,logout}}>
            {children}
        </AuthContext.Provider>
    );
};



export const useAuth = () => {
    return useContext(AuthContext);
};
