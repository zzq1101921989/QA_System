import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import DashboardPage from '../pages/dashboard/DashboardPage';
import ShelfPage from '../pages/shelf/ShelfPage';
import SettingsPage from '../pages/settings/SettingsPage';
import StudyPage from '../pages/study/StudyPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        path: '/',
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: '/dashboard',
        element: <DashboardPage />,
      },
      {
        path: '/shelf',
        element: <ShelfPage />,
      },
      {
        path: '/settings',
        element: <SettingsPage />,
      },
      {
        path: '/study/:docId?',
        element: <StudyPage />,
      },
      // 兼容旧路由
      {
        path: '/bookshelf',
        element: <Navigate to="/shelf" replace />,
      },
      {
        path: '/chat',
        element: <Navigate to="/dashboard" replace />,
      },
    ],
  },
]);
