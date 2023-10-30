import React, { Suspense, lazy } from 'react';

import Footer from './components/footer';
import { LanguageProvider } from './context/LanguageContext';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { SystemProvider } from './context/SystemContext';
import Playground from './components/lexical/PlaygroundApp';
import './App.css';
const Login = lazy(() => import('./pages/login'));
const Profile = lazy(() => import('./pages/profile'));
const SystemSetting = lazy(() => import('./pages/systemSetting'));
const StaticPages = lazy(() => import('./pages/staticPages'));

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
                <Route path='/system-setting' element={<SystemSetting />} />
                <Route path='/newpage' element={<StaticPages />} />
                <Route path='/test' element={<Playground />} />
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
