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
        element: <Navigate to="/chat" replace />,
      },
      {
        path: '/chat',
        element: <ChatPage />,
      },
      {
        path: '/documents',
        element: <DocumentsPage />,
      },
    ],
  },
]);
