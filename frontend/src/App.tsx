import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import GuidePage from './pages/GuidePage';
import HomePage from './pages/HomePage';
import CameraPage from './pages/CameraPage';
import HistoryPage from './pages/HistoryPage';
import AdminPage from './pages/AdminPage';
import RootPage from './pages/RootPage';
import SystemPage from './pages/SystemPage';

function AppRoutes() {
  const { isLoggedIn, isAdmin, isRoot } = useAuth();

  if (!isLoggedIn) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/guide" element={<GuidePage />} />
      <Route path="/camera" element={<CameraPage />} />
      <Route path="/history" element={<HistoryPage />} />
      {isAdmin && <Route path="/admin" element={<AdminPage />} />}
      {isRoot && <Route path="/root" element={<RootPage />} />}
      {isAdmin && <Route path="/system" element={<SystemPage />} />}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
