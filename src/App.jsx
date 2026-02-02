import { BrowserRouter as Router, Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';

// Lazy load pages for code splitting
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const AdminDashboard = lazy(() => import('./pages/Admin/AdminDashboard'));
const UserDashboard = lazy(() => import('./pages/User/UserDashboard'));
const ProjectList = lazy(() => import('./pages/ProjectList'));
const ProjectBoards = lazy(() => import('./pages/ProjectBoards'));
const ProjectSettings = lazy(() => import('./pages/ProjectSettings'));
const BoardView = lazy(() => import('./pages/BoardView'));
const TeamMembers = lazy(() => import('./pages/TeamMembers'));
const Organization = lazy(() => import('./pages/Organization'));

// Wrapper to handle invite token - always show Login/Register if inviteToken is present
const AuthRoute = ({ children, user }) => {
  const [searchParams] = useSearchParams();
  const hasInviteToken = searchParams.get('inviteToken');
  
  // If there's an invite token, always show the page (Login/Register) even if logged in
  if (hasInviteToken) {
    return children;
  }
  
  // Otherwise, redirect logged-in users to dashboard
  if (user) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }
  
  return children;
};

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    }>
      <Routes>
        <Route
          path="/login"
          element={<AuthRoute user={user}><Login /></AuthRoute>}
        />
        <Route
          path="/register"
          element={<AuthRoute user={user}><Register /></AuthRoute>}
        />
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute adminOnly>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <UserDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/organization"
        element={
          <ProtectedRoute>
            <Organization />
          </ProtectedRoute>
        }
      />
      <Route
        path="/team-members"
        element={
          <ProtectedRoute>
            <TeamMembers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects"
        element={
          <ProtectedRoute>
            <ProjectList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/project/:projectId/boards"
        element={
          <ProtectedRoute>
            <ProjectBoards />
          </ProtectedRoute>
        }
      />
      <Route
        path="/project/:projectId/settings"
        element={
          <ProtectedRoute>
            <ProjectSettings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/board/:boardId"
        element={
          <ProtectedRoute>
            <BoardView />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to={user ? (user.role === 'admin' ? '/admin' : '/dashboard') : '/login'} replace />} />
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_relativeSplatPath: true, v7_startTransition: true  }}>
        <div className="min-h-screen bg-gray-50">
          <AppRoutes />
          <Toaster position="top-right" />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

