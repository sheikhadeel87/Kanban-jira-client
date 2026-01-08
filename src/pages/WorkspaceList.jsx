import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { workspaceAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Plus, Building2, Users, ArrowRight, Settings } from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

const WorkspaceList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const fetchWorkspaces = async () => {
    try {
      const response = await workspaceAPI.getAll();
      setWorkspaces(response.data);
    } catch (error) {
      toast.error('Failed to load workspaces');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    try {
      await workspaceAPI.create(formData);
      toast.success('Workspace created successfully');
      setShowModal(false);
      setFormData({ name: '', description: '' });
      fetchWorkspaces();
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Failed to create workspace');
    }
  };

  const getWorkspaceRole = (workspace) => {
    const member = workspace.members?.find((m) => m.user._id === user.id || m.user === user.id);
    if (workspace.createdBy._id === user.id || workspace.createdBy === user.id) {
      return 'creator';
    }
    return member?.role || 'member';
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Workspaces</h1>
            <p className="mt-2 text-gray-600">Select a workspace to view its boards</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Create Workspace</span>
          </button>
        </div>

        {workspaces.length === 0 ? (
          <div className="card text-center py-12">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">You don't have access to any workspaces yet.</p>
            <button onClick={() => setShowModal(true)} className="btn-primary">
              Create Your First Workspace
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workspaces.map((workspace) => {
              const role = getWorkspaceRole(workspace);
              return (
                <div
                  key={workspace._id}
                  className="card hover:shadow-lg transition-shadow cursor-pointer group"
                  onClick={() => navigate(`/workspace/${workspace._id}/boards`)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-primary-100 p-3 rounded-lg">
                        <Building2 className="h-6 w-6 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 group-hover:text-primary-600">
                          {workspace.name}
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
                  {workspace.description && (
                    <p className="text-gray-600 mb-4 line-clamp-2">{workspace.description}</p>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-1 text-gray-500">
                      <Users className="h-4 w-4" />
                      <span>{workspace.members?.length || 0} members</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/workspace/${workspace._id}/settings`);
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600"
                      title="Workspace Settings"
                    >
                      <Settings className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4">Create Workspace</h2>
              <form onSubmit={handleCreateWorkspace} className="space-y-4">
                <div>
                  <label className="label">Workspace Name</label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="e.g., My Company"
                  />
                </div>
                <div>
                  <label className="label">Description (Optional)</label>
                  <textarea
                    className="input-field"
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your workspace..."
                  />
                </div>
                <div className="flex space-x-3">
                  <button type="submit" className="btn-primary flex-1">
                    Create Workspace
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
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
        )}
      </div>
    </Layout>
  );
};

export default WorkspaceList;

