import React, { Suspense, lazy } from 'react';

import Footer from './components/footer';
import { LanguageProvider } from './context/LanguageContext';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

const Login = lazy(() => import('./pages/login'));
const Profile = lazy(() => import('./pages/profile'));

function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <Suspense fallback={<div>Yükleniyor...</div>}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          </Routes>
          <Footer />
        </Suspense>
      </LanguageProvider>
    </BrowserRouter>
  );
}

export default App;
