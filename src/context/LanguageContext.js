import React, { createContext, useState, useEffect, useContext } from 'react';
import i18n from '../translations/i18n'; // i18next yapılandırma dosyanızın yolu
const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('tr'); // Varsayılan dil 'en' olarak ayarlandı.

  useEffect(() => {
    // Dil değiştiğinde i18next dilini de güncelle
    i18n.changeLanguage(language);
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  return useContext(LanguageContext);
};
