import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from '../App';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Discussions from '../pages/Discussions';
import DiscussionDetail from '../pages/DiscussionDetail';
import NotFound from '../pages/NotFound';
import ProtectedRoute from './ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/',
    element: <Navigate to="/app/discussions" replace />,
  },
  {
    path: '/app',
    element: (
      <ProtectedRoute>
        <App />
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'discussions',
        element: <Discussions />,
      },
      {
        path: 'discussions/:id',
        element: <DiscussionDetail />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);
