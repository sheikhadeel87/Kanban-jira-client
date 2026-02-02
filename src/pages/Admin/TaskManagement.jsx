import { useEffect, useState } from 'react';
import { taskAPI, boardAPI, teamAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, FileText } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';

const TaskManagement = () => {
  const [tasks, setTasks] = useState([]);
  const [boards, setBoards] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo',
    board: '',
    assignedToTeam: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const boardsRes = await boardAPI.getAll();
      setBoards(boardsRes.data);

      // Fetch all tasks
      const allTasks = [];
      for (const board of boardsRes.data) {
        try {
          const tasksRes = await taskAPI.getByBoard(board._id);
          const d = tasksRes.data;
          const list = Array.isArray(d) ? d : (d?.tasks ?? []);
          allTasks.push(...list.map((task) => ({ ...task, boardTitle: board.title })));
        } catch (err) {
          // Board might not have tasks
        }
      }
      setTasks(allTasks);

      // Fetch teams
      const teamsData = [];
      for (const board of boardsRes.data) {
        try {
          const teamRes = await teamAPI.getByBoard(board._id);
          teamsData.push({ ...teamRes.data, boardId: board._id });
        } catch (err) {
          // Board might not have team
        }
      }
      setTeams(teamsData);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTask) {
        await taskAPI.update(editingTask._id, formData);
        toast.success('Task updated successfully');
      } else {
        await taskAPI.create(formData);
        toast.success('Task created successfully');
      }
      setShowModal(false);
      setEditingTask(null);
      setFormData({ title: '', description: '', status: 'todo', board: '', assignedToTeam: '' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await taskAPI.delete(id);
      toast.success('Task deleted successfully');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Failed to delete task');
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      status: task.status,
      board: task.board,
      assignedToTeam: task.assignedToTeam?._id || '',
    });
    setShowModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'todo':
        return 'bg-gray-100 text-gray-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
          <h1 className="text-3xl font-bold text-gray-900">Task Management</h1>
          <p className="mt-2 text-gray-600">Create and manage tasks across all boards</p>
        </div>
        <button
          onClick={() => {
            setShowModal(true);
            setEditingTask(null);
            setFormData({ title: '', description: '', status: 'todo', board: '', assignedToTeam: '' });
          }}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Create Task</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.map((task) => (
          <div key={task._id} className="card hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(task)}
                  className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                  title="Edit"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(task._id)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-3">{task.description || 'No description'}</p>
            <div className="flex items-center justify-between">
              <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(task.status)}`}>
                {task.status.replace('_', ' ')}
              </span>
              <span className="text-xs text-gray-500">{task.boardTitle}</span>
            </div>
            {task.assignedToTeam && (
              <div className="mt-2 text-xs text-gray-500">
                Team: {task.assignedToTeam.members?.length || 0} members
              </div>
            )}
          </div>
        ))}
      </div>

      {tasks.length === 0 && (
        <div className="card text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No tasks created yet. Create a task to get started.</p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {editingTask ? 'Edit Task' : 'Create Task'}
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
              <div>
                <label className="label">Board</label>
                <select
                  className="input-field"
                  value={formData.board}
                  onChange={(e) => setFormData({ ...formData, board: e.target.value })}
                  required
                >
                  <option value="">Select a board...</option>
                  {boards.map((board) => (
                    <option key={board._id} value={board._id}>
                      {board.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Status</label>
                <select
                  className="input-field"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="label">Assign to Team (Optional)</label>
                <select
                  className="input-field"
                  value={formData.assignedToTeam}
                  onChange={(e) => setFormData({ ...formData, assignedToTeam: e.target.value })}
                >
                  <option value="">No team assignment</option>
                  {teams
                    .filter((team) => team.boardId === formData.board)
                    .map((team) => (
                      <option key={team._id} value={team._id}>
                        Team ({team.members?.length || 0} members)
                      </option>
                    ))}
                </select>
              </div>
              <div className="flex space-x-3">
                <button type="submit" className="btn-primary flex-1">
                  {editingTask ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingTask(null);
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

export default TaskManagement;

