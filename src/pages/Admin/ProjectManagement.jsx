import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectAPI } from '../../services/api';
import { Plus, Building2, Edit, Trash2, Users, Settings } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useCrudList } from '../../hooks/useCrudList';

const ProjectManagement = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', description: '' });
  const crud = useCrudList({
    fetchAll: projectAPI.getAll,
    create: projectAPI.create,
    update: projectAPI.update,
    delete: projectAPI.delete,
    entityName: 'Project',
    deleteConfirmMessage: 'Are you sure you want to delete this project? This will delete all boards and tasks in it.',
    onSuccess: () => setFormData({ name: '', description: '' }),
  });
  const { items: projects, loading, editingItem: editingProject, setEditingItem: setEditingProject, showModal, setShowModal, handleSubmit: crudSubmit, handleDelete } = crud;

  const handleSubmit = (e) => {
    e.preventDefault();
    crudSubmit(formData);
  };
  const handleEdit = (project) => {
    setEditingProject(project);
    setFormData({ name: project.name, description: project.description || '' });
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Project Management</h1>
          <p className="mt-2 text-gray-600">Create and manage projects</p>
        </div>
        <button
          onClick={() => {
            setShowModal(true);
            setEditingProject(null);
            setFormData({ name: '', description: '' });
          }}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Create Project</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div key={project._id} className="card hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <div className="bg-primary-100 p-3 rounded-lg">
                  <Building2 className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{project.name}</h3>
                  <p className="text-sm text-gray-500">Created by: {project.createdBy?.name}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => navigate(`/project/${project._id}/boards`)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                  title="View Project"
                >
                  <Settings className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleEdit(project)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                  title="Edit"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(project._id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <p className="text-gray-600 mb-4">{project.description || 'No description'}</p>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>{project.members?.length || 0} members</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">
              {editingProject ? 'Edit Project' : 'Create Project'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Name</label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea
                  className="input-field"
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="flex space-x-3">
                <button type="submit" className="btn-primary flex-1">
                  {editingProject ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingProject(null);
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
  );
};

export default ProjectManagement;

