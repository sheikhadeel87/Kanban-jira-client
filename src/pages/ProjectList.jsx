import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectAPI, boardAPI, taskAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Plus, Building2, Users, ArrowRight, Settings, Search, X, FolderKanban, CheckSquare } from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import SkeletonLoader from '../components/SkeletonLoader';

const ProjectList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [projectsWithStats, setProjectsWithStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPanel, setShowPanel] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await projectAPI.getAll();
      const projectsData = response.data;
      setProjects(projectsData);
      
      // Fetch stats for each project
      const projectsWithStatsData = await Promise.all(
        projectsData.map(async (project) => {
          try {
            const boardsRes = await boardAPI.getByProject(project._id);
            const boards = boardsRes.data || [];
            let totalTasks = 0;
            let completedTasks = 0;
            
            for (const board of boards) {
              try {
                const tasksRes = await taskAPI.getByBoard(board._id);
                const tasks = tasksRes.data || [];
                totalTasks += tasks.length;
                completedTasks += tasks.filter(t => t.status === 'completed').length;
              } catch (err) {
                // Board might not have tasks
              }
            }
            
            return {
              ...project,
              stats: {
                boards: boards.length,
                tasks: totalTasks,
                completed: completedTasks,
              },
            };
          } catch (err) {
            return { ...project, stats: { boards: 0, tasks: 0, completed: 0 } };
          }
        })
      );
      
      setProjectsWithStats(projectsWithStatsData);
    } catch (error) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await projectAPI.create(formData);
      toast.success('Project created successfully');
      setShowPanel(false);
      setFormData({ name: '', description: '' });
      fetchProjects();
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Failed to create project');
    }
  };

  const filteredProjects = projectsWithStats.filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getProjectRole = (project) => {
    const member = project.members?.find((m) => (m.user._id || m.user) === (user._id || user.id));
    if ((project.createdBy._id || project.createdBy) === (user._id || user.id)) {
      return 'creator';
    }
    return member?.role || 'member';
  };

  const canCreateProject = () => {
    return ['owner', 'admin', 'manager'].includes(user?.role);
  };

  return (
    <Layout>
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
            <p className="mt-2 text-gray-600">Select a project to view its boards</p>
          </div>
          {canCreateProject() && (
            <button
              onClick={() => setShowPanel(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Create Project</span>
            </button>
          )}
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SkeletonLoader type="project" count={6} />
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="card text-center py-12">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              {searchQuery ? 'No projects found matching your search.' : 'You don\'t have access to any projects yet.'}
            </p>
            {canCreateProject() && (
              <button onClick={() => setShowPanel(true)} className="btn-primary">
                Create Your First Project
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => {
              const role = getProjectRole(project);
              const stats = project.stats || { boards: 0, tasks: 0, completed: 0 };
              const progress = stats.tasks > 0 ? Math.round((stats.completed / stats.tasks) * 100) : 0;
              
              return (
                <div
                  key={project._id}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-lg transition-all cursor-pointer group"
                  onClick={() => navigate(`/project/${project._id}/boards`)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-3 rounded-xl shadow-sm">
                        <Building2 className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                          {project.name}
                        </h3>
                        {role === 'creator' || role === 'admin' ? (
                          <span className="text-xs text-primary-600 font-medium">
                            {role === 'creator' ? 'Creator' : 'Admin'}
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-transform" />
                  </div>
                  {project.description && (
                    <p className="text-gray-600 mb-4 line-clamp-2 text-sm">{project.description}</p>
                  )}
                  
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <FolderKanban className="h-4 w-4 text-gray-600 mx-auto mb-1" />
                      <div className="text-sm font-semibold text-gray-900">{stats.boards}</div>
                      <div className="text-xs text-gray-500">Boards</div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <CheckSquare className="h-4 w-4 text-gray-600 mx-auto mb-1" />
                      <div className="text-sm font-semibold text-gray-900">{stats.tasks}</div>
                      <div className="text-xs text-gray-500">Tasks</div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <div className="h-4 w-4 mx-auto mb-1 flex items-center justify-center">
                        <div className="text-xs font-bold text-primary-600">{progress}%</div>
                      </div>
                      <div className="text-xs text-gray-500">Done</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-1 text-gray-500">
                      <Users className="h-4 w-4" />
                      <span>{project.members?.length || 0} members</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/project/${project._id}/settings`);
                      }}
                      className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                      title="Project Settings"
                    >
                      <Settings className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Slide-in Panel */}
        {showPanel && (
          <>
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
              onClick={() => setShowPanel(false)}
            />
            <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold">Create Project</h2>
                <button
                  onClick={() => {
                    setShowPanel(false);
                    setFormData({ name: '', description: '' });
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto h-[calc(100vh-80px)]">
                <form onSubmit={handleCreateProject} className="space-y-4">
                  <div>
                    <label className="label">Project Name</label>
                    <input
                      type="text"
                      className="input-field"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      placeholder="e.g., Marketing Campaign"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="label">Description (Optional)</label>
                    <textarea
                      className="input-field"
                      rows="4"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe your project..."
                    />
                  </div>
                  <div className="flex space-x-3 pt-4">
                    <button type="submit" className="btn-primary flex-1">
                      Create Project
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPanel(false);
                        setFormData({ name: '', description: '' });
                      }}
                      className="btn-secondary flex-1"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default ProjectList;
