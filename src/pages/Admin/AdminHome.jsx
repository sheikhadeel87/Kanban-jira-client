import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { projectAPI, boardAPI, taskAPI, userAPI } from '../../services/api';
import { Building2, FolderKanban, CheckSquare, Users, User } from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminHome = () => {
  const [stats, setStats] = useState({
    projects: 0,
    boards: 0,
    tasks: 0,
    users: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [projectsRes, boardsRes, usersRes] = await Promise.all([
          projectAPI.getAll(),
          boardAPI.getAll(),
          userAPI.getAll(),
        ]);

        const projects = projectsRes.data;
        const boards = boardsRes.data;
        let totalTasks = 0;

        // Count tasks for all boards
        for (const board of boards) {
          try {
            const tasksRes = await taskAPI.getByBoard(board._id);
            const d = tasksRes.data;
            const list = Array.isArray(d) ? d : (d?.tasks ?? []);
            totalTasks += list.length;
          } catch (err) {
            // Board might not have tasks
          }
        }

        setStats({
          projects: projects.length,
          boards: boards.length,
          tasks: totalTasks,
          users: usersRes.data.length,
        });
      } catch (error) {
        toast.error('Failed to load statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Projects',
      value: stats.projects,
      icon: Building2,
      color: 'bg-purple-500',
      link: '/admin/projects',
    },
    {
      title: 'Total Boards',
      value: stats.boards,
      icon: FolderKanban,
      color: 'bg-blue-500',
      link: '/admin/boards',
    },
    {
      title: 'Total Tasks',
      value: stats.tasks,
      icon: CheckSquare,
      color: 'bg-green-500',
      link: '/admin/tasks',
    },
    {
      title: 'Total Users',
      value: stats.users,
      icon: User,
      color: 'bg-orange-500',
      link: '/admin/users',
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-2 text-gray-600">Manage your Kanban boards, teams, and tasks</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.title}
              to={stat.link}
              className="card hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="h-8 w-8 text-white" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              to="/admin/projects"
              className="block w-full btn-primary text-center"
            >
              Manage Projects
            </Link>
            <Link
              to="/admin/boards"
              className="block w-full btn-secondary text-center"
            >
              Manage Boards
            </Link>
            <Link
              to="/admin/tasks"
              className="block w-full btn-secondary text-center"
            >
              Manage Tasks
            </Link>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">System Information</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <p>Welcome to the Admin Dashboard</p>
            <p>You can manage all projects, boards, tasks, and users from here.</p>
            <p className="mt-4 text-xs text-gray-500">
              Use the navigation menu to access different management sections.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHome;

