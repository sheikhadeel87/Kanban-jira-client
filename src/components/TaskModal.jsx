import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { taskAPI, boardAPI, projectAPI, commentAPI } from '../services/api';
import toast from 'react-hot-toast';
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { X, User, XCircle, Settings, Paperclip, File, MessageSquare } from 'lucide-react';

const TaskModal = ({ boardId, task, onClose, onSave }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo',
    assignedTo: [],
    priority: 'medium',
    dueDate: '',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [currentAttachment, setCurrentAttachment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [projectMembers, setProjectMembers] = useState([]);
  const [board, setBoard] = useState(null);
  const [projectId, setProjectId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [comments, setComments] = useState([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get board to find project
        const boardRes = await boardAPI.getById(boardId);
        setBoard(boardRes.data);

        // Get project members
        if (boardRes.data.project) {
          const projId = boardRes.data.project._id || boardRes.data.project;
          setProjectId(projId);
          const projectRes = await projectAPI.getById(projId);
          setProjectMembers(projectRes.data.members || []);
        }

        // Get current user from localStorage
        const userStr = localStorage.getItem('user');
        if (userStr) {
          setCurrentUser(JSON.parse(userStr));
        }
      } catch (err) {
        console.error('Failed to load project data:', err);
      }
    };

    fetchData();
  }, [boardId]);

  useEffect(() => {
    if (task) {
      console.log('Task received:', task); // Debug: see what task contains
      console.log('Task title:', task.title);
      console.log('Task assignedTo:', task.assignedTo);

      // Handle assignedTo - convert to IDs properly
      let assignedToIds = [];
      if (task.assignedTo && Array.isArray(task.assignedTo)) {
        assignedToIds = task.assignedTo.map((u) => {
          // Handle both populated objects and plain IDs
          if (typeof u === 'object' && u !== null) {
            return String(u._id || u); // Convert to string for consistent comparison
          }
          return String(u);
        });
      }
      setFormData({
        title: task.title,
        description: task.description || '',
        assignedTo: assignedToIds,
        priority: task.priority || 'medium',
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      });
      setCurrentAttachment(task.attachment || null);
      setSelectedFile(null);
      // Fetch comments for this task
      fetchComments();
    } else {
      setFormData({
        title: '',
        description: '',
        assignedTo: [],
        priority: 'medium',
        dueDate: '',
      });
      setCurrentAttachment(null);
      setSelectedFile(null);
      setComments([]);
    }
    setNewCommentText('');
  }, [task?._id]);

  const fetchComments = async () => {
    if (!task?._id) return;
    try {
      const response = await commentAPI.getByTask(task._id);
      setComments(response.data || []);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = {
        ...formData,
        board: boardId,
        assignedTo: formData.assignedTo,
        priority: formData.priority || 'medium',
        dueDate: formData.dueDate || null,
      };
      // If a file is selected, add it to the data
      if (selectedFile) {
        data.attachment = selectedFile;
      }

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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
      setCurrentAttachment(file.name); //clear old attachment if any
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setCurrentAttachment(null);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
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
      const member = projectMembers.find((m) => {
        const memberId = String(m.user._id || m.user);
        return String(userId) === memberId;
      });
      return member?.user?.name || 'Unknown';
    });
  };

  const getUserInitials = (user) => {
    if (!user) return '?';
    const name = user.name || user.email || '';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name[0]?.toUpperCase() || '?';
  };

  const getUserAvatarColor = (userId) => {
    const colors = [
      'bg-gradient-to-br from-blue-500 to-blue-600',
      'bg-gradient-to-br from-purple-500 to-purple-600',
      'bg-gradient-to-br from-pink-500 to-pink-600',
      'bg-gradient-to-br from-green-500 to-green-600',
      'bg-gradient-to-br from-orange-500 to-orange-600',
      'bg-gradient-to-br from-indigo-500 to-indigo-600',
      'bg-gradient-to-br from-teal-500 to-teal-600',
      'bg-gradient-to-br from-rose-500 to-rose-600',
    ];
    if (!userId) return colors[0];
    const index = parseInt(String(userId).slice(-1), 16) % colors.length;
    return colors[index] || colors[0];
  };

  const formatTimeAgo = (date) => {
    if (!date) return 'Just now';
    const now = new Date();
    const past = new Date(date);
    const diff = Math.floor((now - past) / 1000);
    if (diff < 60) return `${diff} seconds ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  };

  const handleCreateComment = async (e) => {
    if (e) e.preventDefault();
    if (!newCommentText.trim() || !task) return;

    setCommentLoading(true);
    try {
      const response = await commentAPI.create(task._id, newCommentText.trim());
      setComments(prev => [response.data, ...prev]);
      setNewCommentText('');
      toast.success('Comment added');
    } catch (error) {
      console.error('Comment create error:', error);
      const errorMsg = error.response?.data?.msg || error.message || 'Failed to add comment';
      toast.error(errorMsg);
    } finally {
      setCommentLoading(false);
    }
  };

  const quillModules = {
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],  // Text styles (Tt)
        ['bold', 'italic'],                  // Bold / Italic
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],  // Lists
        ['link'],                            // Link
        ['code-block'],                      // Code
      ],
    },
  };

  const quillFormats = [
    'header',
    'bold', 'italic',
    'list', 'bullet',
    'link',
    'code-block',
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[95vh] sm:max-h-[90vh] flex flex-col my-4 sm:my-0">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-3 sm:px-4 lg:px-6 py-3 sm:py-4 flex justify-between items-center z-10">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold">{task ? 'Edit Task' : 'Create Task'}</h2>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>

        {/* Main Content - Stack on mobile, side-by-side on desktop */}
        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          {/* Left Column - Form */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 lg:border-r border-gray-200">
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              {/* Title */}
              <div>
                <label className="label text-sm sm:text-base">Title</label>
                <input
                  type="text"
                  className="input-field text-sm sm:text-base"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="label text-sm sm:text-base">Description</label>
                <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                  <ReactQuill
                    key={task?._id || 'new-task'}
                    theme="snow"
                    value={formData.description || ''}
                    onChange={(value) => setFormData({ ...formData, description: value })}
                    modules={quillModules}
                    formats={quillFormats}
                    placeholder="Add a description..."
                    style={{
                      height: '150px',
                    }}
                    className="text-sm sm:text-base"
                  />
                </div>
              </div>

              {/* Priority and Due Date - Stack on mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="label text-sm sm:text-base">Priority</label>
                  <select
                    className="input-field text-sm sm:text-base"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="label text-sm sm:text-base">Due Date</label>
                  <input
                    type="date"
                    className="input-field text-sm sm:text-base"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>
              </div>

              {/* Attachment Section */}
              <div>
                <label className="label flex items-center space-x-2 text-sm sm:text-base">
                  <Paperclip className="h-4 w-4" />
                  <span>Attachment (Optional)</span>
                </label>

                {/* Current attachment */}
                {currentAttachment && !selectedFile && (
                  <div className="mb-3 p-2 sm:p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                    <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                      <div className="bg-blue-100 p-1.5 sm:p-2 rounded flex-shrink-0">
                        <File className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{currentAttachment}</p>
                        <p className="text-xs text-gray-500">Current attachment</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="p-1 text-red-600 hover:bg-red-50 rounded flex-shrink-0 ml-2"
                      title="Remove attachment"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {/* Selected file */}
                {selectedFile && (
                  <div className="mb-3 p-2 sm:p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                    <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                      <div className="bg-green-100 p-1.5 sm:p-2 rounded flex-shrink-0">
                        <File className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{selectedFile.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="p-1 text-red-600 hover:bg-red-50 rounded flex-shrink-0 ml-2"
                      title="Remove File"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {/* File upload input */}
                <div className="border border-gray-200 rounded-lg p-3 sm:p-4 bg-gray-50">
                  <input
                    type="file"
                    id="file-upload"
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx,.txt,.xls,.xlsx"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex items-center space-x-2 text-xs sm:text-sm text-gray-700 hover:text-primary-600 transition-colors"
                  >
                    <Paperclip className="h-4 w-4" />
                    <span>{selectedFile || currentAttachment ? 'Change File' : 'Choose File'}</span>
                  </label>
                  <p className="text-xs text-gray-500 mt-2">
                    Supported formats: Images, PDF, Word, Excel, Text files (Max size: 10MB)
                  </p>
                </div>
              </div>

              {/* Assign to Team Members */}
              <div>
                <label className="label text-sm sm:text-base">Assign to Team Members</label>
                <p className="text-xs text-gray-500 mb-3">
                  Select project members to assign to this task. You can assign multiple people.
                </p>

                {formData.assignedTo.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2">
                      Assigned Members ({formData.assignedTo.length}):
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {getAssignedUserNames().map((name, index) => {
                        const userId = formData.assignedTo[index];
                        const member = projectMembers.find((m) => {
                          const memberId = String(m.user._id || m.user);
                          return String(userId) === memberId;
                        });
                        const user = member?.user;
                        return (
                          <span
                            key={userId}
                            className="inline-flex items-center space-x-1.5 sm:space-x-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-primary-100 text-primary-800 rounded-lg text-xs sm:text-sm border border-primary-200"
                          >
                            <User className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="font-medium truncate max-w-[100px] sm:max-w-none">{name}</span>
                            {user?.email && (
                              <span className="text-xs text-primary-600 hidden sm:inline">({user.email})</span>
                            )}
                            <button
                              type="button"
                              onClick={() => removeAssignedUser(userId)}
                              className="ml-1 hover:text-primary-600 transition-colors flex-shrink-0"
                              title="Remove assignment"
                            >
                              <XCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="border border-gray-200 rounded-lg p-2 sm:p-3 bg-gray-50">
                  <label className="text-xs sm:text-sm font-medium text-gray-700 mb-2 block">
                    Add Team Member:
                  </label>
                  <select
                    className="input-field bg-white text-sm sm:text-base"
                    value=""
                    onChange={(e) => {
                      if (e.target.value) {
                        toggleUserAssignment(e.target.value);
                        e.target.value = '';
                      }
                    }}
                  >
                    <option value="">Select a project member...</option>
                    {projectMembers
                      .filter((m) => {
                        const memberId = String(m.user._id || m.user);
                        return !formData.assignedTo.some((assignedId) => {
                          return String(assignedId) === memberId;
                        });
                      })
                      .map((member) => {
                        const user = member.user;
                        return (
                          <option key={user._id || user} value={user._id || user}>
                            {user.name} ({user.email}) {member.role === 'admin' ? '- Admin' : ''}
                          </option>
                        );
                      })}
                  </select>
                  {projectMembers.length === 0 && (
                    <div className="mt-3 p-3 sm:p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-start space-x-2 sm:space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                            <User className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-600" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="text-xs sm:text-sm font-medium text-yellow-800 mb-1">
                            No project members available
                          </p>
                          <p className="text-xs text-yellow-700 mb-3">
                            You need to add members to the project before you can assign tasks to them.
                          </p>
                          {projectId && (
                            <button
                              type="button"
                              onClick={() => {
                                onClose();
                                navigate(`/project/${projectId}/settings`);
                              }}
                              className="inline-flex items-center space-x-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-xs font-medium rounded-lg transition-colors"
                            >
                              <Settings className="h-3 w-3" />
                              <span>Go to Project Settings</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  {projectMembers.length > 0 && formData.assignedTo.length === 0 && (
                    <p className="text-xs text-gray-500 mt-2">
                      💡 Tip: Select project members to assign this task. You can assign multiple people.
                    </p>
                  )}
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-gray-200">
                <button type="submit" disabled={loading} className="btn-primary flex-1 text-sm sm:text-base py-2 sm:py-2.5">
                  {loading ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
                </button>
                <button type="button" onClick={onClose} className="btn-secondary flex-1 text-sm sm:text-base py-2 sm:py-2.5">
                  Cancel
                </button>
              </div>
            </form>
          </div>

          {/* Right Column - Comments Section - Visible on all screens */}
          <div className="flex flex-col bg-gray-50 border-t lg:border-t-0 lg:border-l border-gray-200 w-full lg:w-80 xl:w-96 flex-shrink-0">
            <div className="p-3 sm:p-4 border-b border-gray-200 bg-white flex-shrink-0">
              <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <MessageSquare className="h-4 w-4 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                <span>Comments ({comments.length})</span>
              </h3>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 sm:space-y-3 md:space-y-4 min-h-0">
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment._id} className="flex items-start space-x-2 sm:space-x-3 bg-white p-2 sm:p-2.5 md:p-3 rounded-lg border border-gray-200">
                    <div className={`w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full ${getUserAvatarColor(comment.author?._id || comment.author)} text-white flex items-center justify-center text-xs sm:text-sm font-semibold flex-shrink-0`}>
                      {getUserInitials(comment.author)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center flex-wrap gap-1 sm:gap-2 mb-1">
                        <span className="font-semibold text-gray-900 text-xs sm:text-sm">
                          {comment.author?.name || 'Unknown'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatTimeAgo(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-700 break-words">{comment.text}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 sm:py-6 md:py-8 text-gray-500 text-xs sm:text-sm">
                  <MessageSquare className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 mx-auto mb-2 sm:mb-3 text-gray-300" />
                  <p>No comments yet</p>
                  <p className="text-xs mt-1">Be the first to comment</p>
                </div>
              )}
            </div>

            {/* Comment Input */}
            <div className="p-3 sm:p-4 border-t border-gray-200 bg-white flex-shrink-0">
              <div className="space-y-2 sm:space-y-3">
                <textarea
                  className="w-full border border-gray-300 rounded-lg p-2 sm:p-2.5 md:p-3 text-xs sm:text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows="2"
                  placeholder="Add a comment..."
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                />
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={handleCreateComment}
                    disabled={!newCommentText.trim() || commentLoading || !task}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {commentLoading ? 'Sending...' : 'Send'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewCommentText('')}
                    className="sm:flex-shrink-0 px-3 sm:px-4 py-1.5 sm:py-2 text-gray-700 hover:bg-gray-100 rounded-lg text-xs sm:text-sm font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

};

export default TaskModal;
