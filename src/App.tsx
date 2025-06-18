import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import UploadPage from './pages/UploadPage';
import { AuthProvider, useAuth } from './context/AuthContext';

const PrivateRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/" replace />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/upload" replace />} />
        <Route
          path="/upload"
          element={
            <PrivateRoute>
              <UploadPage />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/upload" replace />} />
      </Routes>
    </AuthProvider>
  );
};

export default App; 