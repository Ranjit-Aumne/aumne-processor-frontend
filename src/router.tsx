import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import UploadPage from './pages/UploadPage';

export const router = createBrowserRouter([
  {
    path: '/upload',
    element: <UploadPage />,
  },
]); 