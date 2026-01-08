import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import WorkspaceManagement from './WorkspaceManagement';
import BoardManagement from './BoardManagement';
import TaskManagement from './TaskManagement';
import AdminHome from './AdminHome';

const AdminDashboard = () => {
  return (
    <Layout>
      <Routes>
        <Route index element={<AdminHome />} />
        <Route path="workspaces" element={<WorkspaceManagement />} />
        <Route path="boards" element={<BoardManagement />} />
        <Route path="boards/:boardId" element={<BoardManagement />} />
        <Route path="tasks" element={<TaskManagement />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </Layout>
  );
};

export default AdminDashboard;

