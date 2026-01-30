import { useState, useEffect, useRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import DOMPurify from 'dompurify';
import { MoreVertical, Edit, Trash2, User, Image as ImageIcon, File, Paperclip, AlertCircle, Calendar, MessageSquare } from 'lucide-react';
import { getUserInitials, getUserAvatarColor } from '../utils/userDisplay';

const TaskCard = ({ task, onEdit, onDelete }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task._id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // const getStatusColor = (status) => {
  //   switch (status) {
  //     case 'todo':
  //       return 'border-gray-300 bg-white';
  //     case 'in_progress':
  //       return 'border-blue-300 bg-blue-50';
  //     case 'completed':
  //       return 'border-green-300 bg-green-50';
  //     default:
  //       return 'border-gray-300 bg-white';
  //   }
  // };

  // Close dropdown when clicking outside
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  // Prevent drag when clicking menu
  const handleMenuClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setShowDropdown(!showDropdown);
  };

  const handleActionClick = (e, callback) => {
    e.stopPropagation();
    e.preventDefault();
    setShowDropdown(false);
    callback();
  };

  // Priority colors
  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-700 border-green-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  // Check if due date is overdue or soon
  const getDueDateStatus = (dueDate) => {
    if (!dueDate) return null;
    const due = new Date(dueDate);
    const now = new Date();
    const diff = due - now;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (days < 0) return { text: 'Overdue', color: 'text-red-600' };
    if (days === 0) return { text: 'Due today', color: 'text-orange-600' };
    if (days <= 3) return { text: `Due in ${days}d`, color: 'text-yellow-600' };
    return { text: due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), color: 'text-gray-600' };
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white rounded-xl p-4 shadow-sm border border-gray-200 cursor-move hover:shadow-lg transition-all duration-200 group `}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-gray-900 flex-1 text-base leading-tight pr-2">{task.title}</h3>
        <div 
          ref={dropdownRef}
          className="relative opacity-0 group-hover:opacity-100 transition-opacity"
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleMenuClick}
            onPointerDown={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg relative z-10 transition-all"
            title="More options"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
          
          {/* Dropdown Menu */}
          {showDropdown && (
            <div className="absolute right-0 top-9 bg-white border border-gray-200 rounded-xl shadow-xl z-20 min-w-[140px] py-1.5 overflow-hidden">
             <button
                onClick={(e) => handleActionClick(e, () => onEdit(task))}
                className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2 transition-colors"
              >
                <Edit className="h-4 w-4" />
                <span>Add Comments</span>
              </button>
              <button
                onClick={(e) => handleActionClick(e, () => onEdit(task))}
                className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2 transition-colors"
              >
                <Edit className="h-4 w-4" />
                <span>Edit/View</span>
              </button>
              <button
                onClick={(e) => handleActionClick(e, () => onDelete(task._id))}
                className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>
      {task.description && (
  <div 
    className="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed"
    dangerouslySetInnerHTML={{ 
      __html: DOMPurify.sanitize(task.description) 
    }}
  />
)}
      
      {/* Priority and Due Date */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        {task.priority && (
          <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium border ${getPriorityColor(task.priority)}`}>
            <AlertCircle className="h-3 w-3" />
            <span className="capitalize">{task.priority}</span>
          </span>
        )}
        {task.dueDate && (() => {
          const dueDateStatus = getDueDateStatus(task.dueDate);
          return dueDateStatus ? (
            <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium ${dueDateStatus.color}`}>
              <Calendar className="h-3 w-3" />
              <span>{dueDateStatus.text}</span>
            </span>
          ) : null;
        })()}
      </div>
      
      {task.assignedTo && task.assignedTo.length > 0 && (
        <div className="flex items-center space-x-2 mb-3">
          <div className="flex -space-x-2">
            {task.assignedTo.slice(0, 3).map((user, index) => (
              <div
                key={user._id || index}
                className={`w-8 h-8 rounded-full ${getUserAvatarColor(user._id || user)} text-white flex items-center justify-center text-xs font-semibold border-2 border-white shadow-sm`}
                title={user.name || user.email}
              >
                {getUserInitials(user)}
              </div>
            ))}
            {task.assignedTo.length > 3 && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 text-white flex items-center justify-center text-xs font-semibold border-2 border-white shadow-sm">
                +{task.assignedTo.length - 3}
              </div>
            )}
          </div>
          <span className="text-xs text-gray-500">
            {task.assignedTo.length === 1
              ? task.assignedTo[0]?.name || 'Assigned'
              : `${task.assignedTo.length} assigned`}
          </span>
        </div>
      )}
      
      {/* Image Uploaded Attachment Display */}
      {task.attachment && (() => {
        // Check if attachment is a Cloudinary URL (starts with http:// or https://)
        const isCloudinaryUrl = task.attachment.startsWith('http://') || task.attachment.startsWith('https://');
        
        // Get the file URL - use Cloudinary URL directly or construct local URL for backward compatibility
        let fileUrl = task.attachment;
        let fileName = task.attachment;
        
        if (!isCloudinaryUrl) {
          // Backward compatibility: if it's still a filename, construct the old URL
          const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';
          let baseUrl = 'http://localhost:5005';
          if (apiUrl) {
            baseUrl = apiUrl.replace(/\/api\/?$/, '') || 'http://localhost:5005';
          }
          fileUrl = `${baseUrl}/uploads/${task.attachment}`;
          fileName = task.attachment;
        } else {
          // Extract filename from Cloudinary URL for display
          const urlParts = task.attachment.split('/');
          fileName = urlParts[urlParts.length - 1] || 'Attachment';
          // Remove query parameters if any
          fileName = fileName.split('?')[0];
        }
        
        // Check if it's an image based on URL or filename
        const isImage = isCloudinaryUrl 
          ? task.attachment.match(/\.(jpg|jpeg|png|gif|webp)$/i) || task.attachment.includes('image')
          : task.attachment.match(/\.(jpg|jpeg|png|gif|webp)$/i);
        
        return (
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="mb-3 block group/attachment"
          >
            {isImage ? (
              <div className="w-full h-32 rounded-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-200 shadow-sm group-hover/attachment:shadow-md transition-all">
                <img
                  src={fileUrl}
                  alt={fileName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error('Image load error:', fileUrl, task.attachment);
                    e.target.style.display = 'none';
                    const fallback = e.target.parentElement.querySelector('.image-fallback');
                    if (fallback) fallback.style.display = 'flex';
                  }}
                  onLoad={() => console.log('Image loaded successfully:')}
                />
                <div className="image-fallback w-full h-full flex items-center justify-center absolute inset-0" style={{ display: 'none' }}>
                  <ImageIcon className="h-8 w-8 text-gray-400" />
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3 p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:border-gray-300 transition-all shadow-sm group-hover/attachment:shadow-md">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <File className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-900 truncate">{fileName}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Click to preview</p>
                </div>
              </div>
            )}
          </a>
        );
      })()}
      
      <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-100">
        <div className="text-xs text-gray-400">
          {new Date(task.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </div>
        {task.attachment && (
          <div className="flex items-center space-x-1 text-xs text-gray-400">
            <Paperclip className="h-3 w-3" />
            <span>1</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;

