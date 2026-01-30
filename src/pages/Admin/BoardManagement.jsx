import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { boardAPI } from '../../services/api';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useCrudList } from '../../hooks/useCrudList';

const BoardManagement = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ title: '', description: '' });
  const crud = useCrudList({
    fetchAll: boardAPI.getAll,
    create: boardAPI.create,
    update: boardAPI.update,
    delete: boardAPI.delete,
    entityName: 'Board',
    deleteConfirmMessage: 'Are you sure you want to delete this board?',
    onSuccess: () => setFormData({ title: '', description: '' }),
  });
  const { items: boards, loading, editingItem: editingBoard, setEditingItem: setEditingBoard, showModal, setShowModal, handleSubmit: crudSubmit, handleDelete } = crud;

  const handleSubmit = (e) => {
    e.preventDefault();
    crudSubmit(formData);
  };
  const handleEdit = (board) => {
    setEditingBoard(board);
    setFormData({ title: board.title, description: board.description || '' });
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
          <h1 className="text-3xl font-bold text-gray-900">Board Management</h1>
          <p className="mt-2 text-gray-600">Create and manage your Kanban boards</p>
        </div>
        <button onClick={() => { setShowModal(true); setEditingBoard(null); setFormData({ title: '', description: '' }); }} className="btn-primary flex items-center space-x-2" type="button">
          <Plus className="h-5 w-5" />
          <span>Create Board</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {boards.map((board) => (
          <div key={board._id} className="card hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-gray-900">{board.title}</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => navigate(`/board/${board._id}`)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                  title="View Board"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleEdit(board)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                  title="Edit"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(board._id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <p className="text-gray-600 mb-4">{board.description || 'No description'}</p>
            <div className="text-sm text-gray-500">
              <p>Owner: {board.owner?.name || 'Unknown'}</p>
              <p>Members: {board.members?.length || 0}</p>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">
              {editingBoard ? 'Edit Board' : 'Create Board'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Title</label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
                  {editingBoard ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditingBoard(null); }}
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

export default BoardManagement;

