import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { ToastProvider } from './components/ToastContainer';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Users from './pages/Users';
import Categories from './pages/Categories';
import Board from './pages/Board';
import Subjects from './pages/Subjects';
import Chapters from './pages/Chapters';
import PublicCourses from './pages/PublicCourses';
import CourseChapters from './pages/CourseChapters';
import CommissionSettings from './pages/CommissionSettings';
import Thumbnails from './pages/Thumbnails';
import Settings from './pages/Settings';
import Analytics from './pages/Analytics';
import { SkeletonStatCard, SkeletonCard } from './components/Skeleton';

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(true);
  const { isAuthenticated, isLoading } = useAuth();
  const { colors } = useTheme();

  // Get active tab from route
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.startsWith('/chapters/')) return 'subjects';
    if (path.startsWith('/course-chapters/')) return 'courses';
    if (path === '/dashboard' || path === '/') return 'dashboard';
    return path.substring(1) || 'dashboard';
  };

  const activeTab = getActiveTab();

  const setActiveTab = (tab: string) => {
    if (tab === 'dashboard') {
      navigate('/dashboard');
    } else if (tab === 'thumbnails') {
      navigate('/thumbnails');
    } else if (tab === 'subjects') {
      navigate('/subjects');
    } else if (tab === 'users') {
      navigate('/users');
    } else if (tab === 'categories') {
      navigate('/categories');
    } else if (tab === 'board') {
      navigate('/board');
    } else if (tab === 'courses') {
      navigate('/courses');
    } else if (tab === 'commission-settings') {
      navigate('/commission-settings');
    } else if (tab === 'settings') {
      navigate('/settings');
    } else if (tab === 'analytics') {
      navigate('/analytics');
    } else {
      navigate(`/${tab}`);
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      if (user) {
        return;
      }
    }
  }, []);

  // Redirect authenticated users away from login/signup pages
  useEffect(() => {
    if (isAuthenticated && (location.pathname === '/login' || location.pathname === '/signup')) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, location.pathname, navigate]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <div className="flex-1 p-8">
          <div className="space-y-8">
            <div>
              <div className="h-8 bg-gray-200 rounded w-64 animate-pulse mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonStatCard key={i} />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route
          path="/signup"
          element={<Signup onSwitchToLogin={() => navigate('/login')} />}
        />
        <Route
          path="/login"
          element={<Login onSwitchToSignup={() => navigate('/signup')} />}
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div
      className="flex min-h-screen transition-colors duration-300"
      style={{ backgroundColor: colors.background }}
    >
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
      <div className={`transition-all duration-300 ease-in-out flex-1 ${isExpanded ? 'ml-64' : 'ml-20'}`}>
        <div
          className="shadow-sm border-b px-8 py-4 transition-colors duration-300"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
        >
            <h2
              className="text-2xl font-bold bg-clip-text text-transparent"
              style={{
                background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
            {location.pathname.startsWith('/chapters/') 
              ? 'Chapters' 
              : location.pathname.startsWith('/course-chapters/')
              ? 'Course Chapters'
              : activeTab === 'commission-settings'
              ? 'Commission Settings'
              : activeTab === 'thumbnails'
              ? 'Thumbnails'
              : activeTab === 'settings'
              ? 'Settings'
              : activeTab === 'analytics'
              ? 'Analytics'
              : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </h2>
        </div>
        <div
          className="min-h-[calc(100vh-73px)] transition-colors duration-300"
          style={{
            background: `linear-gradient(to bottom right, ${colors.background}, ${colors.background}dd)`,
          }}
        >
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/thumbnails" element={<Thumbnails />} />
            <Route path="/users" element={<Users />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/subjects" element={<Subjects />} />
            <Route path="/chapters/:subjectId" element={<Chapters />} />
            <Route path="/board" element={<Board />} />
            <Route path="/courses" element={<PublicCourses />} />
            <Route path="/course-chapters/:courseId" element={<CourseChapters />} />
            <Route path="/commission-settings" element={<CommissionSettings />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route
              path="*"
              element={
                <div className="p-8">
                  <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                      Page Not Found
                    </h3>
                    <p className="text-gray-600">The page you're looking for doesn't exist.</p>
                  </div>
                </div>
              }
            />
          </Routes>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
