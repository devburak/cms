import React, { Suspense, lazy } from 'react';

import Footer from './components/footer';
import { LanguageProvider } from './context/LanguageContext';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { SystemProvider } from './context/SystemContext';
import './App.css';
const Login = lazy(() => import('./pages/login'));
const Profile = lazy(() => import('./pages/profile'));

function App() {
  return (
    <SystemProvider>
    <AuthProvider>
      <BrowserRouter>
        <LanguageProvider>

          <Suspense fallback={<div>Yükleniyor...</div>}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path='/' element={<ProtectedRoute />}>
                <Route path='/' element={<Profile />} />
                <Route path='/profile' element={<Profile />} />
              </Route>
            
            </Routes>
            <Footer />
          </Suspense>

        </LanguageProvider>

      </BrowserRouter>
    </AuthProvider>
    </SystemProvider>
  );
}

export default App;
