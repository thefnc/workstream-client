import { createBrowserRouter, Navigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import Dashboard from '../pages/Dashboard';
import Board from '../pages/Board';
import TaskList from '../pages/TaskList';
import TaskDetail from '../pages/TaskDetail';
import Workload from '../pages/Workload';
import WorkloadDetail from '../pages/WorkloadDetail';
import Activity from '../pages/Activity';
import Users from '../pages/Users';
import Settings from '../pages/Settings';

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: '/', element: <Navigate to="/dashboard" replace /> },
      { path: '/dashboard', element: <Dashboard /> },
      { path: '/board', element: <Board /> },
      { path: '/tasks', element: <TaskList /> },
      { path: '/tasks/:id', element: <TaskDetail /> },
      { path: '/workload', element: <Workload /> },
      { path: '/workload/:designerId', element: <WorkloadDetail /> },
      { path: '/activity', element: <Activity /> },
      { path: '/users', element: <Users /> },
      { path: '/settings', element: <Settings /> },
    ],
  },
]);
