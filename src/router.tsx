import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import UploadPage from './pages/UploadPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/upload" replace />,
  },
  {
    path: '/upload',
    element: <UploadPage />,
  },
]); 