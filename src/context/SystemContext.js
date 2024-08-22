// SystemContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios'; 
import config from '../config';
const SystemContext = createContext();

export const useSystem = () => {
    return useContext(SystemContext);
}

export const SystemProvider = ({ children }) => {
    const [systemInfo, setSystemInfo] = useState({
        languageList: [],
        imageSizes: [],
        userRoles: []
    });

    useEffect(() => {
        // Sistem bilgilerini API'den al
        const fetchSystemInfo = async () => {
            try {
                const response = await axios.get(`${config.baseURL}api/system/information`);
                const data = response.data;
                // API'den dönen veriyi key değerlerine göre bir objede topla
                let updatedSystemInfo = {};
                data.forEach(item => {
                    updatedSystemInfo[item.key] = item.value;
                });

                setSystemInfo(prevState => ({
                    ...prevState,
                    ...updatedSystemInfo
                }));
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
