import { useState, useEffect } from 'react';
import { LayoutDashboard, Users, ShoppingCart, BarChart3, Settings, LogOut, Package, FileText, ChevronLeft, ChevronRight, FolderTree, BookOpen, GraduationCap, BookMarked } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from './ToastContainer';
import ConfirmDialog from './ConfirmDialog';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
}

export default function Sidebar({ activeTab, setActiveTab, isExpanded, setIsExpanded }: SidebarProps) {
  const { logout, user } = useAuth();
  const { showToast } = useToast();
  const [imageError, setImageError] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Reset image error when user changes
  useEffect(() => {
    setImageError(false);
  }, [user?._id]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      showToast('Logout successful', 'success');
    } catch (error) {
      showToast('Logout failed. Please try again.', 'error');
    } finally {
      setIsLoggingOut(false);
      setShowLogoutConfirm(false);
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'Admin Users', icon: Users },
    { id: 'categories', label: 'Categories', icon: FolderTree },
    { id: 'subjects', label: 'Subjects', icon: BookOpen },
    { id: 'board', label: 'Board', icon: GraduationCap },
    { id: 'courses', label: 'Public Courses', icon: BookMarked },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div
      className={`bg-white h-screen fixed left-0 top-0 shadow-xl flex flex-col transition-all duration-300 ease-in-out ${
        isExpanded ? 'w-64' : 'w-20'
      }`}
    >
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        {isExpanded && (
          <div className="flex items-center gap-3 flex-1">
            <div className="bg-gradient-to-br from-sky-400 to-sky-600 p-2 rounded-lg flex-shrink-0">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-gray-800 truncate">Adhyan Guru</h1>
              <p className="text-xs text-gray-500 truncate">Super Admin Panel</p>
            </div>
          </div>
        )}
        {!isExpanded && (
          <div className="bg-gradient-to-br from-sky-400 to-sky-600 p-2 rounded-lg mx-auto">
            <LayoutDashboard className="w-6 h-6 text-white" />
          </div>
        )}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex-shrink-0 ml-2 p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          title={isExpanded ? 'Collapse' : 'Expand'}
        >
          {isExpanded ? (
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-600" />
          )}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-6">
        <nav className="space-y-1 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-sky-400 to-sky-500 text-white shadow-md'
                    : 'text-gray-700 hover:bg-sky-50'
                }`}
                title={!isExpanded ? item.label : ''}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {isExpanded && <span className="font-medium truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      <div className={`p-4 border-t border-gray-200 transition-all duration-300 ${isExpanded ? 'px-4' : 'px-2'}`}>
        <div className={`flex items-center gap-3 py-3 mb-2 ${isExpanded ? 'px-4' : 'px-1'}`}>
          {user?.profilePicture && !imageError ? (
            <img
              src={user.profilePicture}
              alt={`${user.firstName} ${user.lastName}`}
              className="w-10 h-10 rounded-full object-cover flex-shrink-0 border-2 border-gray-200"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-sky-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
              {user?.firstName?.charAt(0).toUpperCase() || 'A'}
            </div>
          )}
          {isExpanded && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          )}
        </div>
        <button
          onClick={() => setShowLogoutConfirm(true)}
          disabled={isLoggingOut}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            !isExpanded ? 'justify-center' : ''
          }`}
          title={!isExpanded ? 'Logout' : ''}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {isExpanded && <span className="font-medium">{isLoggingOut ? 'Logging out...' : 'Logout'}</span>}
        </button>
      </div>

      <ConfirmDialog
        isOpen={showLogoutConfirm}
        title="Confirm Logout"
        message="Are you sure you want to logout? You will need to login again to access the Adhyan Guru Super Admin Panel."
        confirmText="Yes, Logout"
        cancelText="Cancel"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </div>
  );
}
