/**
 * CMS Configuration
 * 
 * Bu dosya environment variables (.env dosyaları) kullanarak
 * development ve production ortamları için otomatik konfigürasyon sağlar.
 * 
 * Development: npm start -> .env.development kullanır
 * Production: npm run build -> .env.production kullanır
 * Local Override: .env.local (gitignore'da, kişisel ayarlar için)
 */

const config = {
  // API Base URL - Development: localhost, Production: api.tmmob.org.tr
  baseURL: process.env.REACT_APP_BASE_URL || 'http://127.0.0.1:5000/',

  // Frontend URL
  frontEndUrl: process.env.REACT_APP_FRONTEND_URL || 'https://newt6491032g.tmmob.org.tr/',

  // App Information
  appName: process.env.REACT_APP_NAME || 'IKONX CMS',
  version: process.env.REACT_APP_VERSION || '1.3.1',
  versionNum: parseFloat(process.env.REACT_APP_VERSION_NUM) || 11.0,

  // UI Configuration
  logo: process.env.REACT_APP_LOGO || '/logo_default.png',
  createAccountLink: process.env.REACT_APP_CREATE_ACCOUNT_LINK === 'true' || false,

  // Environment Info (for debugging)
  environment: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
};

// Development modunda console'a config bilgilerini yazdır
if (config.isDevelopment) {
  console.log('🔧 CMS Configuration:', {
    environment: config.environment,
    baseURL: config.baseURL,
    version: config.version,
  });
}

export default config;