// SystemContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios'; // Eğer axios kullanıyorsanız
import config from '../config';
const SystemContext = createContext();

export const useSystem = () => {
    return useContext(SystemContext);
}

export const SystemProvider = ({ children }) => {
    const [systemInfo, setSystemInfo] = useState({
        languageOptions: [],
        imageSizes: [],
        userRoles: []
    });

    useEffect(() => {
        // Sistem bilgilerini API'den al
        const fetchSystemInfo = async () => {
            try {
                const response = await axios.get(`${config.baseURL}api/system/information`);
                setSystemInfo(response.data);
            } catch (error) {
                console.error("System information fetch failed:", error);
            }
        };

        fetchSystemInfo();
    }, []);

    return (
        <SystemContext.Provider value={systemInfo}>
            {children}
        </SystemContext.Provider>
    );
}
