import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('accessToken'));

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
                    console.log(response.data)
                    if (isMounted) { // Sadece bileşen mount edildiyse state güncellemesi yap
                        if (response.data.user.isAuthenticated) {
                            setIsLoggedIn(true);
                        } else {
                            setIsLoggedIn(false);
                        }
                    }
                } catch (error) {
                    console.error("Authentication check failed:", error);
                    setIsLoggedIn(false);
                }
            }
        };

        checkAuthentication();
        return () => {
            isMounted = false; // Cleanup fonksiyonunda bileşenin unmount edildiğini belirt
        };
    }, []);

    useEffect(()=>{ console.log("use effect on Provider :" , isLoggedIn)},[isLoggedIn])

    return (
        <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
