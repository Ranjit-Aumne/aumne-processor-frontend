import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProjectsPage from './pages/ProjectsPage';
import NewProjectPage from './pages/NewProjectPage';
import DataProcessingPage from './pages/DataProcessingPage';
import UploadPage from './pages/UploadPage';
import UploadStatusPage from './pages/UploadStatusPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout><Navigate to="/projects" replace /></Layout>,
  },
  {
    path: '/projects',
    element: <Layout><ProjectsPage /></Layout>,
  },
  {
    path: '/new-project',
    element: <Layout><NewProjectPage /></Layout>,
  },
  {
    path: '/project/:projectKey/data-processing',
    element: <Layout><DataProcessingPage /></Layout>,
  },
  {
    path: '/upload',
    element: <Layout><UploadPage /></Layout>,
  },
  {
    path: '/uploads',
    element: <Layout><UploadStatusPage /></Layout>,
  },
]); 