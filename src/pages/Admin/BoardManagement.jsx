import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { boardAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';

const BoardManagement = () => {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBoard, setEditingBoard] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '' });

  useEffect(() => {
    fetchBoards();
  }, []);

  const fetchBoards = async () => {
    try {
      const response = await boardAPI.getAll();
      setBoards(response.data);
    } catch (error) {
      toast.error('Failed to load boards');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBoard) {
        await boardAPI.update(editingBoard._id, formData);
        toast.success('Board updated successfully');
      } else {
        await boardAPI.create(formData);
        toast.success('Board created successfully');
      }
      setShowModal(false);
      setEditingBoard(null);
      setFormData({ title: '', description: '' });
      fetchBoards();
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this board?')) return;
    try {
      await boardAPI.delete(id);
      toast.success('Board deleted successfully');
      fetchBoards();
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Failed to delete board');
    }
  };

  const handleEdit = (board) => {
    setEditingBoard(board);
    setFormData({ title: board.title, description: board.description || '' });
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
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
        <button onClick={() => { setShowModal(true); setEditingBoard(null); setFormData({ title: '', description: '' }); }} className="btn-primary flex items-center space-x-2">
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

