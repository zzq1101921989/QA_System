import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import ChatPage from '../pages/Chat';
import DocumentsPage from '../pages/Documents';

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
        element: <DocumentsPage defaultTab="dashboard" />,
      },
      {
        path: '/shelf',
        element: <DocumentsPage defaultTab="shelf" />,
      },
      {
        path: '/settings',
        element: <DocumentsPage defaultTab="settings" />,
      },
      {
        path: '/study/:docId?',
        element: <ChatPage />,
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
