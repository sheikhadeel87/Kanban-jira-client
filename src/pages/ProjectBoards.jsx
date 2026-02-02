import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, useDroppable } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { projectAPI, boardAPI, taskAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Plus, ArrowLeft, FolderKanban, Edit, Trash2, Settings, User } from 'lucide-react';
import Layout from '../components/Layout';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';

// Droppable Board Column Component
const BoardColumn = ({ board, boardTasks, children, isProjectMember, isProjectAdmin, user, onEditBoard, onDeleteBoard, onCreateTask }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: board._id,
  });

  // Generate a unique gradient color for each board based on its ID
  const getBoardGradient = (boardId) => {
    const gradients = [
      'bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800',
      'bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800',
      'bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-800',
      'bg-gradient-to-br from-pink-600 via-pink-700 to-pink-800',
      'bg-gradient-to-br from-teal-600 via-teal-700 to-teal-800',
      'bg-gradient-to-br from-orange-600 via-orange-700 to-orange-800',
      'bg-gradient-to-br from-cyan-600 via-cyan-700 to-cyan-800',
      'bg-gradient-to-br from-rose-600 via-rose-700 to-rose-800',
    ];
    if (!boardId) return gradients[0];
    const index = parseInt(String(boardId).slice(-1), 16) % gradients.length;
    return gradients[index] || gradients[0];
  };

  return (
    <div
      ref={setNodeRef}
      key={board._id}
      className="flex-shrink-0 w-80 flex flex-col"
      style={{
        backgroundColor: isOver ? 'rgba(139, 92, 246, 0.08)' : 'transparent',
        borderRadius: '16px',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* Board Header - Modern Gradient Design */}
      <div className={`${getBoardGradient(board._id)} text-white rounded-t-2xl p-5 mb-4 shadow-xl relative overflow-hidden`}>
        {/* Decorative background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full -ml-12 -mb-12"></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold tracking-tight drop-shadow-sm">{board.title}</h2>
            {(isProjectAdmin || (board.owner?._id || board.owner) === (user?._id || user?.id) || ['admin', 'owner', 'manager'].includes(user?.role)) && (
              <div className="flex space-x-1.5">
                <button
                  onClick={() => onEditBoard(board)}
                  className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg text-white transition-all backdrop-blur-sm shadow-sm hover:shadow-md"
                  title="Edit Board"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onDeleteBoard(board._id)}
                  className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg text-white transition-all backdrop-blur-sm shadow-sm hover:shadow-md"
                  title="Delete Board"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
          {board.description && (
            <p className="text-sm text-white text-opacity-90 mb-3 line-clamp-2 leading-relaxed">{board.description}</p>
          )}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white text-opacity-90 bg-white bg-opacity-20 px-3 py-1.5 rounded-full backdrop-blur-sm">
              {boardTasks.length} {boardTasks.length === 1 ? 'task' : 'tasks'}
            </span>
            {isProjectMember && (
              <button
                onClick={() => onCreateTask(board._id)}
                className="bg-white text-purple-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-opacity-95 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-1.5"
              >
                <Plus className="h-4 w-4" />
                <span>Add Task</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tasks Column - Clean Modern Design */}
      <div className="bg-gradient-to-b from-gray-50 to-gray-100 rounded-b-2xl p-4 min-h-[600px] space-y-3 flex-1 border border-gray-200 shadow-inner">
        {children}
        {boardTasks.length === 0 && (
          <div className="text-center text-gray-400 py-16 border-2 border-dashed border-gray-300 rounded-xl bg-white">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4 shadow-inner">
                <FolderKanban className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-sm font-medium mb-2 text-gray-500">No tasks yet</p>
              {isProjectMember ? (
                <button
                  onClick={() => onCreateTask(board._id)}
                  className="mt-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:from-purple-700 hover:to-purple-800 transition-all shadow-md hover:shadow-lg transform hover:scale-105 flex items-center space-x-2 mx-auto"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create First Task</span>
                </button>
              ) : (
                <p className="text-xs text-gray-400 mt-2">Drop tasks here</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ProjectBoards = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [boards, setBoards] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBoardModal, setShowBoardModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingBoard, setEditingBoard] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedBoardId, setSelectedBoardId] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '' });
  const pendingUpdatesRef = useRef(new Set());
  const refreshTimeoutRef = useRef(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px of movement before drag starts (prevents accidental drags)
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchData();
  }, [projectId]);

  const fetchData = async () => {
    try {
      const [projectRes, boardsRes] = await Promise.all([
        projectAPI.getById(projectId),
        boardAPI.getByProject(projectId),
      ]);
      setProject(projectRes.data);
      // Ensure boards are sorted by createdAt ascending (oldest first, left to right)
      const sortedBoards = [...(boardsRes.data || [])].sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateA - dateB; // Ascending: oldest first
      });
      setBoards(sortedBoards);
      
      // Fetch all tasks from all boards
      if (boardsRes.data && boardsRes.data.length > 0) {
        const allTasksPromises = boardsRes.data.map(board => 
          taskAPI.getByBoard(board._id).catch(() => ({ data: [] }))
        );
        const allTasksResults = await Promise.all(allTasksPromises);
        const allTasks = allTasksResults.flatMap(res => {
          const d = res.data;
          return Array.isArray(d) ? d : (d?.tasks ?? []);
        });
        setTasks(allTasks);
      } else {
        setTasks([]);
      }
    } catch (error) {
      toast.error('Failed to load project');
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  const handleBoardSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBoard) {
        await boardAPI.update(editingBoard._id, formData);
        toast.success('Board updated successfully');
      } else {
        await boardAPI.create({ ...formData, projectId });
        toast.success('Board created successfully');
      }
      setShowBoardModal(false);
      setEditingBoard(null);
      setFormData({ title: '', description: '' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Operation failed');
    }
  };

  const handleDeleteBoard = async (id) => {
    if (!window.confirm('Are you sure you want to delete this board? All tasks in this board will be deleted.')) return;
    try {
      await boardAPI.delete(id);
      toast.success('Board deleted successfully');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Failed to delete board');
    }
  };

  const handleEditBoard = (board) => {
    setEditingBoard(board);
    setFormData({ title: board.title, description: board.description || '' });
    setShowBoardModal(true);
  };

  const handleCreateTask = (boardId) => {
    setSelectedBoardId(boardId);
    setEditingTask(null);
    setShowTaskModal(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setSelectedBoardId(task.board._id || task.board);
    setShowTaskModal(true);
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await taskAPI.delete(taskId);
      toast.success('Task deleted successfully');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Failed to delete task');
    }
  };

  const handleTaskSaved = () => {
    setShowTaskModal(false);
    setEditingTask(null);
    setSelectedBoardId(null);
    fetchData();
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (!over || !active) {
      return;
    }

    // Get task ID and destination ID - normalize to strings
    const taskId = String(active.id);
    const overId = String(over.id);

    // Check if this task is already being updated (prevent duplicate updates)
    if (pendingUpdatesRef.current.has(taskId)) {
      console.log('Task already being updated, skipping:', taskId);
      return; // Already updating this task, ignore duplicate drag
    }

    // Find the task being dragged - use current tasks state
    const task = tasks.find((t) => String(t._id) === taskId);
    
    if (!task) {
      console.warn('Task not found in current state:', taskId, 'Available task IDs:', tasks.map(t => t._id));
      return;
    }

    // Find source board (where task currently is) - normalize board ID
    const currentBoardId = task.board?._id 
      ? String(task.board._id) 
      : String(task.board || '');
    
    // Determine destination board ID
    // over.id could be:
    // 1. A board ID (when dropping on board column)
    // 2. A task ID (when dropping on a task within a board)
    let destinationBoardId = overId;
    let destinationBoard = boards.find((b) => String(b._id) === overId);
    
    // If over.id is not a board, it might be a task - find that task's board
    if (!destinationBoard) {
      const overTask = tasks.find((t) => String(t._id) === overId);
      if (overTask) {
        const overTaskBoardId = overTask.board?._id 
          ? String(overTask.board._id) 
          : String(overTask.board || '');
        destinationBoard = boards.find((b) => String(b._id) === overTaskBoardId);
        if (destinationBoard) {
          destinationBoardId = String(destinationBoard._id);
        }
      }
    }
    
    if (!destinationBoard) {
      console.warn('Destination board not found:', {
        overId,
        availableBoards: boards.map(b => b._id),
        availableTasks: tasks.map(t => ({ id: t._id, board: t.board?._id || t.board }))
      });
      return;
    }
    
    destinationBoardId = String(destinationBoard._id);

    // Find source board - might not exist if task was just moved optimistically
    const sourceBoard = boards.find((b) => String(b._id) === currentBoardId);

    // Check if task is already in the destination board
    if (currentBoardId === destinationBoardId) {
      return; // Already in this board, no update needed
    }

    // Add to pending updates to prevent duplicate drags of the same task
    pendingUpdatesRef.current.add(taskId);
    
    // Get source board title for toast message (use current board or "Unknown")
    const sourceBoardTitle = sourceBoard?.title || 'Unknown Board';

    // Optimistic update - immediately update UI for smooth experience
    // Use functional update to ensure we're working with latest state
    setTasks((currentTasks) => {
      return currentTasks.map((t) => {
        if (String(t._id) === taskId) {
          return { 
            ...t, 
            board: String(destinationBoardId) // Ensure it's a string for consistent filtering
          };
        }
        return t;
      });
    });

    try {
      // Update task's board in backend with all required information
      await taskAPI.update(taskId, { 
        board: destinationBoardId 
      });
      
      // Remove from pending updates
      pendingUpdatesRef.current.delete(taskId);
      
      // Show success toast (but don't refresh immediately to allow more drags)
      toast.success(`Task "${task.title}" moved to ${destinationBoard.title}`, {
        duration: 1500,
      });
      
      // Batch refresh: if no more pending updates, refresh data after a delay
      // This allows multiple rapid drags to complete before refreshing
      if (pendingUpdatesRef.current.size === 0) {
        // Clear any existing timeout
        if (refreshTimeoutRef.current) {
          clearTimeout(refreshTimeoutRef.current);
        }
        // Set new timeout to batch refresh - longer delay for better batching
        refreshTimeoutRef.current = setTimeout(() => {
          fetchData();
          refreshTimeoutRef.current = null;
        }, 1000); // 1 second delay to batch multiple rapid drags
      }
    } catch (error) {
      console.error('Failed to move task:', error);
      toast.error(error.response?.data?.msg || 'Failed to move task');
      
      // Remove from pending updates
      pendingUpdatesRef.current.delete(taskId);
      
      // Revert optimistic update on error by refreshing immediately
      fetchData();
    }
  };

  const isProjectMember = () => {
    if (!project || !user) return false;
    if (['admin', 'owner', 'manager'].includes(user.role)) return true;
    
    const userId = user._id || user.id;
    if (!userId) return false;
    
    const normalizeId = (id) => {
      if (!id) return null;
      if (typeof id === 'object') {
        if (id._id) return String(id._id);
        if (id.toString) return String(id);
        return null;
      }
      return String(id);
    };
    
    const userIdStr = normalizeId(userId);
    const member = project.members?.find((m) => {
      const memberUserId = m.user?._id || m.user;
      const memberIdStr = normalizeId(memberUserId);
      return memberIdStr === userIdStr;
    });
    
    return !!member;
  };

  const isProjectAdmin = () => {
    if (!project || !user) return false;
    if (['admin', 'owner', 'manager'].includes(user.role)) return true;
    
    const userId = user._id || user.id;
    if (!userId) return false;
    
    const normalizeId = (id) => {
      if (!id) return null;
      if (typeof id === 'object') {
        if (id._id) return String(id._id);
        if (id.toString) return String(id);
        return null;
      }
      return String(id);
    };
    
    const userIdStr = normalizeId(userId);
    const member = project.members?.find((m) => {
      const memberUserId = m.user?._id || m.user;
      const memberIdStr = normalizeId(memberUserId);
      return memberIdStr === userIdStr;
    });
    
    return member?.role === 'admin';
  };

  const canCreateBoard = () => {
    return ['owner', 'admin', 'manager'].includes(user?.role) || isProjectAdmin();
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <Layout>
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
              <p className="text-gray-600 mt-1">{project.description || 'No description'}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate(`/project/${projectId}/settings`)}
              className="btn-secondary flex items-center space-x-2"
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </button>
            {canCreateBoard() && (
              <button
                onClick={() => {
                  setShowBoardModal(true);
                  setEditingBoard(null);
                  setFormData({ title: '', description: '' });
                }}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>Create Board</span>
              </button>
            )}
          </div>
        </div>

        {/* Kanban Board View - Boards as Columns */}
        {boards.length === 0 ? (
          <div className="card text-center py-12">
            <FolderKanban className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No boards in this project yet.</p>
            {canCreateBoard() && (
              <button
                onClick={() => {
                  setShowBoardModal(true);
                  setEditingBoard(null);
                  setFormData({ title: '', description: '' });
                }}
                className="btn-primary inline-flex items-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>Create Your First Board</span>
              </button>
            )}
          </div>
        ) : (
          <DndContext 
            sensors={sensors} 
            collisionDetection={closestCenter} 
            onDragEnd={handleDragEnd}
            onDragStart={(event) => {
              // Optional: Add visual feedback when drag starts
              console.log('Drag started:', event.active.id);
            }}
          >
            <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {boards.map((board) => {
                const boardTasks = tasks.filter((task) => {
                  // Normalize task board ID (can be object with _id or just ID string)
                  const taskBoardId = task.board?._id 
                    ? String(task.board._id) 
                    : String(task.board || '');
                  // Normalize board ID
                  const boardIdStr = String(board._id || '');
                  return taskBoardId === boardIdStr;
                });

                return (
                  <BoardColumn
                    key={board._id}
                    board={board}
                    boardTasks={boardTasks}
                    isProjectMember={isProjectMember()}
                    isProjectAdmin={isProjectAdmin()}
                    user={user}
                    onEditBoard={handleEditBoard}
                    onDeleteBoard={handleDeleteBoard}
                    onCreateTask={handleCreateTask}
                  >
                    <SortableContext
                      items={boardTasks.map((task) => task._id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {boardTasks.map((task) => (
                        <TaskCard
                          key={task._id}
                          task={task}
                          onEdit={handleEditTask}
                          onDelete={handleDeleteTask}
                        />
                      ))}
                    </SortableContext>
                  </BoardColumn>
                );
              })}
            </div>
          </DndContext>
        )}

        {/* Create/Edit Board Modal */}
        {showBoardModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4">
                {editingBoard ? 'Edit Board' : 'Create Board'}
              </h2>
              <form onSubmit={handleBoardSubmit} className="space-y-4">
                <div>
                  <label className="label">Title</label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., To Do, In Progress, Done"
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
                    placeholder="Describe what this board is for..."
                  />
                </div>
                <div className="flex space-x-3">
                  <button type="submit" className="btn-primary flex-1">
                    {editingBoard ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowBoardModal(false);
                      setEditingBoard(null);
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

        {/* Create/Edit Task Modal */}
        {showTaskModal && selectedBoardId && (
          <TaskModal
            boardId={selectedBoardId}
            task={editingTask}
            onClose={() => {
              setShowTaskModal(false);
              setEditingTask(null);
              setSelectedBoardId(null);
            }}
            onSave={handleTaskSaved}
          />
        )}
      </div>
    </Layout>
  );
};

export default ProjectBoards;
