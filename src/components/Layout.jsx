import { Link, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, LayoutDashboard, Users, FolderKanban, CheckSquare, Building2, ChevronDown, User as UserIcon, Menu, X } from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setShowMobileMenu(false);
      }
    };
    if (showProfileDropdown || showMobileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileDropdown, showMobileMenu]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getUserInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : name[0]?.toUpperCase() || '?';
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
                <Link
                  to="/team-members"
                  className="flex items-center space-x-1 px-2 lg:px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <Users className="h-4 w-4" />
                  <span>Team Members</span>
                </Link>
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
              <div className="relative" ref={dropdownRef}>
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
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
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
                      onClick={handleLogout}
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
            <div className="md:hidden relative" ref={dropdownRef}>
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-sm font-semibold">
                  {getUserInitials(user?.name)}
                </div>
              </button>

              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
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
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
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
                  <Link
                    to="/team-members"
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <Users className="h-4 w-4" />
                    <span>Team Members</span>
                  </Link>
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