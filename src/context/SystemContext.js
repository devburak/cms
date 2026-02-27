// SystemContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSystemInformation } from '../api';
import { useAuth } from './AuthContext';

const SystemContext = createContext();

export const useSystem = () => {
    return useContext(SystemContext);
}

export const SystemProvider = ({ children }) => {
    const { isLoggedIn } = useAuth();
    const [systemInfo, setSystemInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchSystemInfo = React.useCallback(async () => {
        try {
            setLoading(true);
            const data = await getSystemInformation();
            setSystemInfo(data);
            setError(null);
        } catch (error) {
            console.error("System information fetch failed:", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!isLoggedIn) {
            setSystemInfo(null);
            setError(null);
            setLoading(false);
            return;
        }

        fetchSystemInfo();
    }, [isLoggedIn, fetchSystemInfo]);

    return (
        <SystemContext.Provider value={{ systemInfo, loading, error, refreshSystemInfo: fetchSystemInfo }}>
            {children}
        </SystemContext.Provider>
    );
}
