import { Link, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { enableNotification } from '../enableNotification';
import { onMessage } from 'firebase/messaging';
import { messaging } from '../firebase';
import { notificationAPI } from '../services/api';
import { LogOut, LayoutDashboard, Users, FolderKanban, CheckSquare, Building2, ChevronDown, User as UserIcon, Menu, X, Bell } from 'lucide-react';
import { getUserInitials } from '../utils/userDisplay';

const Layout = ({ children }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const desktopDropdownRef = useRef(null);
  const mobileDropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const notificationDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (desktopDropdownRef.current && !desktopDropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
      if (mobileDropdownRef.current && !mobileDropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setShowMobileMenu(false);
      }
      if (notificationDropdownRef.current && !notificationDropdownRef.current.contains(event.target)) {
        setShowNotificationDropdown(false);
      }
    };
    if (showProfileDropdown || showMobileMenu || showNotificationDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showProfileDropdown, showMobileMenu, showNotificationDropdown]);

  const fetchNotifications = async () => {
    try {
      const [notificationsRes, countRes] = await Promise.all([
        notificationAPI.getAll(),
        notificationAPI.getUnreadCount()
      ]);
      setNotifications(notificationsRes.data || []);
      setNotificationCount(countRes.data?.count || 0);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user]);

  useEffect(() => {
    const unsub = onMessage(messaging, async (payload) => {
      try {
        await notificationAPI.create({
          title: payload?.notification?.title || "Notification",
          body: payload?.notification?.body || "",
          link: payload?.data?.link || '/',
          data: payload?.data || {}
        });
        await fetchNotifications();
      } catch (err) {
        console.error('Failed to save notification:', err);
      }
      if (Notification.permission === "granted") {
        new Notification(
          payload?.notification?.title || "Notification",
          { body: payload?.notification?.body || "" }
        );
      }
    });
    return () => unsub();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Logo */}
            <Link to={isAdmin() ? '/admin' : '/dashboard'} className="flex items-center space-x-1.5 sm:space-x-2 flex-shrink-0">
              <FolderKanban className="h-6 w-6 sm:h-8 sm:w-8 text-primary-600" />
              <span className="text-lg sm:text-xl font-bold text-gray-900">Kanban Board</span>
            </Link>
            {/* <button
                  onClick={() => setNotificationCount(notificationCount + 1)}
                  className="flex items-center space-x-1 px-2 lg:px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <Bell className="h-4 w-4" />
                  <span>Notifications<span className="text-xs text-gray-500">{notificationCount}</span></span>
                </button> */}

            {/* Desktop Navigation */}
            {isAdmin() ? (
              <nav className="hidden md:flex items-center space-x-2 lg:space-x-4 flex-1 ml-4 lg:ml-8">
                <Link
                  to="/admin"
                  className="flex items-center space-x-1 px-2 lg:px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  to="/admin/projects"
                  className="flex items-center space-x-1 px-2 lg:px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <Users className="h-4 w-4" />
                  <span>Projects</span>
                </Link>
                <Link
                  to="/admin/boards"
                  className="flex items-center space-x-1 px-2 lg:px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <FolderKanban className="h-4 w-4" />
                  <span>Boards</span>
                </Link>
                <Link
                  to="/admin/tasks"
                  className="flex items-center space-x-1 px-2 lg:px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <CheckSquare className="h-4 w-4" />
                  <span>Tasks</span>
                </Link>

                
              </nav>
            ) : (
              <nav className="hidden md:flex items-center space-x-2 lg:space-x-4 flex-1 ml-4 lg:ml-8">
                <Link
                  to="/organization"
                  className="flex items-center space-x-1 px-2 lg:px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <Building2 className="h-4 w-4" />
                  <span>Organization</span>
                </Link>
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-1 px-2 lg:px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>My Projects</span>
                </Link>
                {/* <Link
                  to="/team-members"
                  className="flex items-center space-x-1 px-2 lg:px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <Users className="h-4 w-4" />
                  <span>Team Members</span>
                </Link> */}
                <div className="relative" ref={notificationDropdownRef}>
                  <button
                    onClick={() => {
                      setShowNotificationDropdown(!showNotificationDropdown);
                      if (!showNotificationDropdown) fetchNotifications();
                    }}
                    className="relative flex items-center space-x-1 px-2 lg:px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <Bell className="h-4 w-4" />
                    <span>Notifications</span>
                    {notificationCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {notificationCount > 9 ? '9+' : notificationCount}
                      </span>
                    )}
                  </button>
                  {showNotificationDropdown && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-[100] max-h-96 flex flex-col">
                      <div className="p-3 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="font-semibold text-gray-900">Notifications</h3>
                        {notificationCount > 0 && (
                          <button
                            onClick={async () => {
                              await notificationAPI.markAllAsRead();
                              await fetchNotifications();
                            }}
                            className="text-xs text-blue-600 hover:text-blue-700"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="overflow-y-auto flex-1">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-gray-500 text-sm">No notifications</div>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n._id}
                              onClick={async () => {
                                if (!n.isRead) {
                                  await notificationAPI.markAsRead(n._id);
                                  await fetchNotifications();
                                }
                                if (n.link) {
                                  navigate(n.link);
                                  setShowNotificationDropdown(false);
                                }
                              }}
                              className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${!n.isRead ? 'bg-blue-50' : ''}`}
                            >
                              <p className="text-sm font-medium text-gray-900">{n.title}</p>
                              <p className="text-xs text-gray-600 mt-1">{n.body}</p>
                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(n.createdAt).toLocaleString()}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </nav>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              {showMobileMenu ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>

            {/* Profile Dropdown - Desktop */}
            <div className="hidden md:flex items-center">
              <div className="relative" ref={desktopDropdownRef}>
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center space-x-2 px-2 lg:px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                    {getUserInitials(user?.name)}
                  </div>
                  <div className="text-left hidden lg:block">
                    <div className="text-sm font-medium text-gray-900 truncate max-w-[120px]">{user?.name}</div>
                    <div className="text-xs text-gray-500 truncate max-w-[120px]">{user?.email}</div>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-500 hidden lg:block" />
                </button>
                

                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-[100]">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="text-sm font-medium text-gray-900">{user?.name}</div>
                      <div className="text-xs text-gray-500 truncate">{user?.email}</div>
                      {isAdmin() && (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-primary-100 text-primary-800 text-xs font-semibold rounded">
                          Admin
                        </span>
                      )}
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        enableNotification();
                      }}
                      onMouseDown={(e) => e.stopPropagation()}
                      className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <span>Enable Push Notifications</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowProfileDropdown(false);
                        handleLogout();
                      }}
                      onMouseDown={(e) => e.stopPropagation()}
                      onTouchStart={(e) => e.stopPropagation()}
                      className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Profile Avatar - Mobile Only */}
            <div className="md:hidden relative" ref={mobileDropdownRef}>
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-sm font-semibold">
                  {getUserInitials(user?.name)}
                </div>
              </button>

              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-[100]">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="text-sm font-medium text-gray-900">{user?.name}</div>
                    <div className="text-xs text-gray-500 truncate">{user?.email}</div>
                    {isAdmin() && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-primary-100 text-primary-800 text-xs font-semibold rounded">
                        Admin
                      </span>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowProfileDropdown(false);
                      handleLogout();
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors cursor-pointer touch-manipulation"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {showMobileMenu && (
            <div ref={mobileMenuRef} className="md:hidden border-t border-gray-200 py-3">
              {isAdmin() ? (
                <div className="flex flex-col space-y-1">
                  <Link
                    to="/admin"
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                  <Link
                    to="/admin/projects"
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <Users className="h-4 w-4" />
                    <span>Projects</span>
                  </Link>
                  <Link
                    to="/admin/boards"
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <FolderKanban className="h-4 w-4" />
                    <span>Boards</span>
                  </Link>
                  <Link
                    to="/admin/tasks"
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <CheckSquare className="h-4 w-4" />
                    <span>Tasks</span>
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col space-y-1">
                  <Link
                    to="/organization"
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <Building2 className="h-4 w-4" />
                    <span>Organization</span>
                  </Link>
                  <Link
                    to="/dashboard"
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span>My Projects</span>
                  </Link>
                  {/* <Link
                    to="/team-members"
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <Users className="h-4 w-4" />
                    <span>Team Members</span>
                  </Link> */}
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;