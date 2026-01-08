import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { taskAPI, boardAPI, workspaceAPI } from '../services/api';
import toast from 'react-hot-toast';
import { X, User, XCircle, Settings } from 'lucide-react';

const TaskModal = ({ boardId, task, onClose, onSave }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo',
    assignedTo: [],
  });
  const [loading, setLoading] = useState(false);
  const [workspaceMembers, setWorkspaceMembers] = useState([]);
  const [board, setBoard] = useState(null);
  const [workspaceId, setWorkspaceId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get board to find workspace
        const boardRes = await boardAPI.getById(boardId);
        setBoard(boardRes.data);

        // Get workspace members
        if (boardRes.data.workspace) {
          const wsId = boardRes.data.workspace._id || boardRes.data.workspace;
          setWorkspaceId(wsId);
          const workspaceRes = await workspaceAPI.getById(wsId);
          setWorkspaceMembers(workspaceRes.data.members || []);
        }
      } catch (err) {
        console.error('Failed to load workspace data:', err);
      }
    };

    fetchData();
  }, [boardId]);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        status: task.status,
        assignedTo: task.assignedTo?.map((u) => u._id || u) || [],
      });
    } else {
      setFormData({
        title: '',
        description: '',
        status: 'todo',
        assignedTo: [],
      });
    }
  }, [task]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = {
        ...formData,
        board: boardId,
        assignedTo: formData.assignedTo,
      };

      if (task) {
        await taskAPI.update(task._id, data);
        toast.success('Task updated successfully');
      } else {
        await taskAPI.create(data);
        toast.success('Task created successfully');
      }
      onSave();
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const toggleUserAssignment = (userId) => {
    setFormData((prev) => ({
      ...prev,
      assignedTo: prev.assignedTo.includes(userId)
        ? prev.assignedTo.filter((id) => id !== userId)
        : [...prev.assignedTo, userId],
    }));
  };

  const removeAssignedUser = (userId) => {
    setFormData((prev) => ({
      ...prev,
      assignedTo: prev.assignedTo.filter((id) => id !== userId),
    }));
  };

  const getAssignedUserNames = () => {
    return formData.assignedTo.map((userId) => {
      const member = workspaceMembers.find((m) => (m.user._id || m.user) === userId);
      return member?.user?.name || 'Unknown';
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">{task ? 'Edit Task' : 'Create Task'}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
              rows="4"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
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
            <label className="label">Assign to Team Members</label>
            <p className="text-xs text-gray-500 mb-3">
              Select workspace members to assign to this task. You can assign multiple people.
            </p>
            
            {formData.assignedTo.length > 0 && (
              <div className="mb-3">
                <p className="text-sm font-medium text-gray-700 mb-2">Assigned Members ({formData.assignedTo.length}):</p>
                <div className="flex flex-wrap gap-2">
                  {getAssignedUserNames().map((name, index) => {
                    const userId = formData.assignedTo[index];
                    const member = workspaceMembers.find((m) => (m.user._id || m.user) === userId);
                    const user = member?.user;
                    return (
                      <span
                        key={userId}
                        className="inline-flex items-center space-x-2 px-3 py-2 bg-primary-100 text-primary-800 rounded-lg text-sm border border-primary-200"
                      >
                        <User className="h-4 w-4" />
                        <span className="font-medium">{name}</span>
                        {user?.email && (
                          <span className="text-xs text-primary-600">({user.email})</span>
                        )}
                        <button
                          type="button"
                          onClick={() => removeAssignedUser(userId)}
                          className="ml-1 hover:text-primary-600 transition-colors"
                          title="Remove assignment"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Add Team Member:
              </label>
              <select
                className="input-field bg-white"
                value=""
                onChange={(e) => {
                  if (e.target.value) {
                    toggleUserAssignment(e.target.value);
                    e.target.value = '';
                  }
                }}
              >
                <option value="">Select a workspace member...</option>
                {workspaceMembers
                  .filter((m) => !formData.assignedTo.includes(m.user._id || m.user))
                  .map((member) => {
                    const user = member.user;
                    return (
                      <option key={user._id || user} value={user._id || user}>
                        {user.name} ({user.email}) {member.role === 'admin' ? '- Admin' : ''}
                      </option>
                    );
                  })}
              </select>
              {workspaceMembers.length === 0 && (
                <div className="mt-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-yellow-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-yellow-800 mb-1">
                        No workspace members available
                      </p>
                      <p className="text-xs text-yellow-700 mb-3">
                        You need to add members to the workspace before you can assign tasks to them.
                      </p>
                      {workspaceId && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            navigate(`/workspace/${workspaceId}/settings`);
                          }}
                          className="inline-flex items-center space-x-2 px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-xs font-medium rounded-lg transition-colors"
                        >
                          <Settings className="h-3 w-3" />
                          <span>Go to Workspace Settings</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {workspaceMembers.length > 0 && formData.assignedTo.length === 0 && (
                <p className="text-xs text-gray-500 mt-2">
                  💡 Tip: Select workspace members to assign this task. You can assign multiple people.
                </p>
              )}
            </div>
          </div>
          <div className="flex space-x-3 pt-4">
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
