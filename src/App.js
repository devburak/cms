import React, { Suspense, lazy } from 'react';

import Footer from './components/footer';
import { LanguageProvider } from './context/LanguageContext';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { SystemProvider } from './context/SystemContext';
import Playground from './components/lexical/playground';
import './App.css';
import './index.css';
import '../src/components/lexical/themes/CommentEditorTheme.css';
import '../src/components/lexical/themes/PlaygroundEditorTheme'

import ForgetPasswordPage from './pages/ForgetPasswordPage';
import NewPasswordPage from './pages/NewPasswordPage';

const Login = lazy(() => import('./pages/login'));
const Profile = lazy(() => import('./pages/profile'));
const SystemSetting = lazy(() => import('./pages/systemSetting'));
const StaticPages = lazy(() => import('./pages/staticPages'));
const FilesPage = lazy(()=>import('./pages/filesPages'));
const ContentPage = lazy(()=>import('./pages/content'));
const ContentsPage = lazy(()=>import('./pages/contentsPage'))
const CategoryPage = lazy(()=> import('./pages/category'));
const PeriodPage = lazy(()=> import('./pages/period'));
const RolePage = lazy(()=>import('./pages/rolePage'));
const UsersPage = lazy(()=>import('./pages/usersPage'));
const UserPage = lazy(()=>import('./pages/userPage'));
const EventPage =lazy(()=>import('./pages/eventPage'));
const EventsPage = lazy(()=>import('./pages/eventsPage'));
const AppTokensPage = lazy(()=>import('./pages/appTokensPage'));
const UnderConstructionPage = lazy(()=>import('./pages/underConstructionPage'));
const CelebrationPage = lazy(()=>import('./pages/celebrationPage'));
const CelebrationListPage =lazy(()=>import('./pages/CelebrationListPage'));
const PeriodDocumentFormPage = lazy(()=>import('./pages/PeriodDocumentFormPage'));
const PeriodDocumentListPage = lazy(()=>import('./pages/PeriodDocumentListPage'));
const CelebrationPublicationPage = lazy(()=>import('./pages/celebrationPublicationPage'));
const CampaignFormPage = lazy(()=>import('./pages/CampaignFormPage'));
const CampaignListPage = lazy(()=>import('./pages/CampaignListPage'));
const PublicationsPage = lazy(()=>import('./pages/PublicationsPage'));
const ChamberPage = lazy(()=>import('./pages/ChamberPage'));
const BoardPage = lazy(()=>import('./pages/BoardPage'));
const BoardTypesPage = lazy(()=>import('./pages/BoardTypesPage'));
const VideosPage = lazy(()=>import('./pages/VideosPage'));
const IKKPage = lazy(()=>import('./pages/IKKPage'));
const ExpertisePage = lazy(()=>import('./pages/expertisePage')); // Lazy import for ExpertisePage

function App() {
  return (
    <SystemProvider>
    <AuthProvider>
      <BrowserRouter>
        <LanguageProvider>
          <Suspense fallback={<div>Yükleniyor...</div>}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/forget-password" element={<ForgetPasswordPage />} />
              <Route path="/reset/:token?" element={<NewPasswordPage />} />
              <Route path='/' element={<ProtectedRoute />}>
                <Route path='/' element={<Profile />} />
                <Route path='/content/:id?' element={<ContentPage />} /> 
                <Route path='/files' element={<FilesPage />} />
                <Route path='/profile' element={<Profile />} />
                <Route path='/system-setting' element={<SystemSetting />} />
                <Route path='/newpage' element={<StaticPages />} />
                <Route path='/allpages' element={<ContentsPage />} />
                <Route path='/test' element={<Playground />} />
                <Route path='/category' element={<CategoryPage />} />
                <Route path='/period' element={<PeriodPage />} />
                <Route path='/role' element={<RolePage />} />
                <Route path='/users' element={<UsersPage />} />
                <Route path='/user/:id?' element={<UserPage />} />
                <Route path='/events' element={<EventsPage />} />
                <Route path='/event/:id?' element={<EventPage />} />
                <Route path='/apptoken' element={<AppTokensPage />} /> 
                <Route path='/celebration/:id?' element={<CelebrationPage />} />
                <Route path='/celebrations' element={<CelebrationListPage />} />
                <Route path='/period-document/:id?' element={<PeriodDocumentFormPage />} />
                <Route path='/period-documents' element={<PeriodDocumentListPage />} />
                <Route path='/celebration-publication/:id?' element={<CelebrationPublicationPage />} />
                <Route path='/campaign/:id?' element={<CampaignFormPage />} />
                <Route path='/campaigns' element={<CampaignListPage />} /> 
                <Route path='/publication/:id?' element={<PublicationsPage />} />
                <Route path='/chambers' element={<ChamberPage />} />
                <Route path='/boards' element={<BoardPage />} />
                <Route path='/videos' element={<VideosPage />} />
                <Route path='/board-types' element={<BoardTypesPage />} />
                <Route path='/ikk' element={<IKKPage />} />
                <Route path='/expertise' element={<ExpertisePage />} /> {/* Add the new route */}
                <Route path="*" element={<UnderConstructionPage />} />
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

// Note: Add a MenuItem for "Bilirkişilik Eğitimleri" linking to "/expertise"
// in your application's navigation component (e.g., Sidebar, Header).
