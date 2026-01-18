# CMS Environment Configuration

Bu proje environment-based configuration kullanır. Development ve production ortamları için farklı API URL'leri otomatik olarak kullanılır.

## 📁 Environment Dosyaları

### `.env.development`
Development modunda (`npm start`) kullanılır.
- **API URL:** `http://127.0.0.1:5000/`
- **Kullanım:** Local geliştirme

### `.env.production`
Production build'de (`npm run build`) kullanılır.
- **API URL:** `https://api.tmmob.org.tr/`
- **Kullanım:** Production deployment

### `.env.local` (Optional)
Kişisel geliştirme ayarları için kullanılır. **Git'e commit edilmez.**
- Bu dosyayı `.env.development` ve `.env.production` ayarlarını override etmek için kullanabilirsiniz.

## 🚀 Kullanım

### Development
```bash
npm start
# .env.development kullanılır
# API: http://127.0.0.1:5000/
```

### Production Build
```bash
npm run build
# .env.production kullanılır
# API: https://api.tmmob.org.tr/
```

### Production Server
```bash
npm start
# Build edilmiş dosyaları serve eder
```

## ⚙️ Environment Variables

| Variable | Development | Production | Açıklama |
|----------|-------------|------------|----------|
| `REACT_APP_BASE_URL` | `http://127.0.0.1:5000/` | `https://api.tmmob.org.tr/` | Backend API URL |
| `REACT_APP_FRONTEND_URL` | `https://newt6491032g.tmmob.org.tr/` | `https://newt6491032g.tmmob.org.tr/` | Frontend URL |
| `REACT_APP_NAME` | `IKONX CMS` | `IKONX CMS` | Uygulama adı |
| `REACT_APP_VERSION` | `1.3.1` | `1.3.1` | Versiyon |
| `REACT_APP_VERSION_NUM` | `11.0` | `11.0` | Versiyon numarası |
| `REACT_APP_LOGO` | `/logo_default.png` | `/logo_default.png` | Logo path |
| `REACT_APP_CREATE_ACCOUNT_LINK` | `false` | `false` | Hesap oluşturma linki |

## 📝 Notlar

- **Tüm environment variable'lar `REACT_APP_` prefix'i ile başlamalıdır** (Create React App kuralı)
- `.env.local` dosyası `.gitignore`'da olduğu için commit edilmez
- `.env.development` ve `.env.production` dosyaları commit edilir
- Environment değişiklikleri için development server'ı yeniden başlatmanız gerekir

## 🔍 Debug

Development modunda, console'da config bilgileri görüntülenir:

```javascript
🔧 CMS Configuration: {
  environment: 'development',
  baseURL: 'http://127.0.0.1:5000/',
  version: '1.3.1'
}
```

## 📦 Deployment

Production build alırken otomatik olarak `.env.production` dosyası kullanılır:

```bash
npm run build
# Build klasörü oluşturulur
# Production API URL'i kullanılır
```

Build sonrası `build/` klasörünü sunucuya deploy edebilirsiniz.
