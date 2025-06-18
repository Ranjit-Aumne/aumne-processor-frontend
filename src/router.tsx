import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import UploadPage from './pages/UploadPage';
import UploadStatusPage from './pages/UploadStatusPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/upload" replace />,
  },
  {
    path: '/upload',
    element: <UploadPage />,
  },
  {
    path: '/uploads',
    element: <UploadStatusPage />,
  },
]); 