import React from 'react';
import config from '../config';
import { useLanguage } from '../context/LanguageContext';


const Footer = ({ appName =config.appName || "Uygulama Adı", appVersion=config.version || "1.0.0" }) => {
  const currentYear = new Date().getFullYear();
  const { language, setLanguage } = useLanguage();
  return (
    <div style={styles.footerContainer}>
      <div style={styles.leftContainer}>
        {currentYear} - {appName}
      </div>
      <div style={styles.rightContainer}>
        <div style={styles.versionContainer}>
          Versiyon: {appVersion}
        </div>
        <div style={styles.languageContainer}>
          <select value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="en">English</option>
            <option value="tr">Türkçe</option>
            {/* Diğer dilleri buraya ekleyebilirsiniz */}
          </select>
        </div>
      </div>
    </div>
  );
};

const styles = {
    footerContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px 20px',
      borderTop: '1px solid #ccc',
      backgroundColor: '#f7f7f7'
    },
    leftContainer: {},
    rightContainer: {
      display: 'flex',
      alignItems: 'center'
    },
    versionContainer: {
      marginRight: '10px'
    },
    languageContainer: {}
  };

export default Footer;
