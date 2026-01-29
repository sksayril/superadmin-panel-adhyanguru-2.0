import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ToastContainer';
import { api } from '../services/api';
import { UserPlus, Eye, Search, Plus, X, MapPin, Navigation } from 'lucide-react';
import Skeleton, { SkeletonUserRow } from '../components/Skeleton';

interface UserListItem {
  _id: string;
  userId: string;
  email: string;
  role: string;
}

interface UserDetails {
  _id: string;
  userId: string;
  email: string;
  mobileNumber: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  profilePicture?: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  updatedAt: string;
  password?: string;
  encryptedPassword?: string;
}

const USER_TYPES = [
  'ADMIN',
  'DISTRICT_COORDINATOR',
  'COORDINATOR',
  'FIELD_MANAGER',
  'TEAM_LEADER',
  'FIELD_EMPLOYEE',
] as const;

type UserType = typeof USER_TYPES[number];

export default function Users() {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserDetails | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [includePassword, setIncludePassword] = useState(false);
  const [loadingUserDetails, setLoadingUserDetails] = useState(false);

  // Create Admin Form State
  const [adminForm, setAdminForm] = useState({
    email: '',
    mobileNumber: '',
    password: '',
    firstName: '',
    lastName: '',
    profilePicture: null as File | null,
    latitude: '' as string | number,
    longitude: '' as string | number,
  });

  // Create User Form State
  const [userForm, setUserForm] = useState({
    userType: 'ADMIN' as UserType,
    email: '',
    mobileNumber: '',
    password: '',
    firstName: '',
    lastName: '',
    district: '',
    profilePicture: null as File | null,
    latitude: '' as string | number,
    longitude: '' as string | number,
  });

  const [gettingLocation, setGettingLocation] = useState(false);

  useEffect(() => {
    if (token) {
      fetchUsers();
    }
  }, [token]);

  const fetchUsers = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await api.getAllUsers(token);
      if (response.success) {
        setUsers(response.data);
        showToast(`Loaded ${response.count} users`, 'success');
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to fetch users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = (isAdmin: boolean) => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser', 'error');
      return;
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        if (isAdmin) {
          setAdminForm({
            ...adminForm,
            latitude: latitude,
            longitude: longitude,
          });
        } else {
          setUserForm({
            ...userForm,
            latitude: latitude,
            longitude: longitude,
          });
        }
        showToast('Location captured successfully!', 'success');
        setGettingLocation(false);
      },
      (error) => {
        let errorMessage = 'Failed to get location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }
        showToast(errorMessage, 'error');
        setGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setLoading(true);
    try {
      const latitude = adminForm.latitude && adminForm.latitude !== '' ? parseFloat(adminForm.latitude.toString()) : undefined;
      const longitude = adminForm.longitude && adminForm.longitude !== '' ? parseFloat(adminForm.longitude.toString()) : undefined;

      const response = await api.createAdmin(
        token,
        adminForm.email,
        adminForm.mobileNumber,
        adminForm.password,
        adminForm.firstName,
        adminForm.lastName,
        adminForm.profilePicture || undefined,
        latitude,
        longitude
      );

      if (response.success) {
        showToast('Admin created successfully!', 'success');
        setShowCreateAdmin(false);
        resetAdminForm();
        fetchUsers();
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to create admin', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    // Validate district for non-ADMIN users
    if (userForm.userType !== 'ADMIN' && !userForm.district.trim()) {
      showToast('District is required for this user type', 'error');
      return;
    }

    setLoading(true);
    try {
      const latitude = userForm.latitude && userForm.latitude !== '' ? parseFloat(userForm.latitude.toString()) : undefined;
      const longitude = userForm.longitude && userForm.longitude !== '' ? parseFloat(userForm.longitude.toString()) : undefined;

      const response = await api.createUser(
        token,
        userForm.userType,
        userForm.email,
        userForm.mobileNumber,
        userForm.password,
        userForm.firstName,
        userForm.lastName,
        userForm.userType !== 'ADMIN' ? userForm.district : undefined,
        userForm.profilePicture || undefined,
        latitude,
        longitude
      );

      if (response.success) {
        showToast(`${userForm.userType} created successfully!`, 'success');
        setShowCreateUser(false);
        resetUserForm();
        fetchUsers();
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to create user', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleViewUserDetails = async (userId: string, shouldIncludePassword?: boolean) => {
    if (!token) return;
    setLoadingUserDetails(true);
    if (!showUserDetails) {
      setShowUserDetails(true);
    }
    try {
      const includePass = shouldIncludePassword !== undefined ? shouldIncludePassword : includePassword;
      const response = await api.getUserDetails(token, userId, includePass);
      if (response.success) {
        setSelectedUser(response.data);
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to fetch user details', 'error');
    } finally {
      setLoadingUserDetails(false);
    }
  };

  const resetAdminForm = () => {
    setAdminForm({
      email: '',
      mobileNumber: '',
      password: '',
      firstName: '',
      lastName: '',
      profilePicture: null,
      latitude: '',
      longitude: '',
    });
  };

  const resetUserForm = () => {
    setUserForm({
      userType: 'ADMIN',
      email: '',
      mobileNumber: '',
      password: '',
      firstName: '',
      lastName: '',
      district: '',
      profilePicture: null,
      latitude: '',
      longitude: '',
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isAdmin: boolean) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        showToast('Please upload a valid image file (JPEG, PNG, GIF, or WebP)', 'error');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showToast('File size must be less than 5MB', 'error');
        return;
      }
      if (isAdmin) {
        setAdminForm({ ...adminForm, profilePicture: file });
      } else {
        setUserForm({ ...userForm, profilePicture: file });
      }
      showToast('Profile picture selected successfully', 'success');
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      SUPER_ADMIN: 'bg-purple-100 text-purple-700',
      ADMIN: 'bg-blue-100 text-blue-700',
      DISTRICT_COORDINATOR: 'bg-green-100 text-green-700',
      COORDINATOR: 'bg-yellow-100 text-yellow-700',
      FIELD_MANAGER: 'bg-orange-100 text-orange-700',
      TEAM_LEADER: 'bg-pink-100 text-pink-700',
      FIELD_EMPLOYEE: 'bg-gray-100 text-gray-700',
    };
    return colors[role] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Users Management</h1>
          <p className="text-gray-600">Manage all users in the Adhyan Guru system</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowCreateAdmin(true)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <UserPlus className="w-5 h-5" />
            Create Admin
          </button>
          <button
            onClick={() => setShowCreateUser(true)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors disabled:opacity-50"
          >
            <Plus className="w-5 h-5" />
            Create User
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by email, user ID, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={loading}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none disabled:bg-gray-100"
          />
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-sky-400 to-sky-500 text-white">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">User ID</th>
                <th className="px-6 py-4 text-left font-semibold">Email</th>
                <th className="px-6 py-4 text-left font-semibold">Role</th>
                <th className="px-6 py-4 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <SkeletonUserRow key={index} />
                  ))}
                </>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="border-b border-gray-100 hover:bg-sky-50 transition">
                    <td className="px-6 py-4 font-semibold text-sky-600">{user.userId}</td>
                    <td className="px-6 py-4 text-gray-800">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(user.role)}`}>
                        {user.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleViewUserDetails(user.userId)}
                        className="flex items-center gap-2 px-3 py-1 bg-sky-100 text-sky-700 rounded-lg hover:bg-sky-200 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Admin Modal */}
      {showCreateAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Create Admin</h2>
                <button
                  onClick={() => {
                    setShowCreateAdmin(false);
                    resetAdminForm();
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleCreateAdmin} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                    <input
                      type="text"
                      required
                      value={adminForm.firstName}
                      onChange={(e) => setAdminForm({ ...adminForm, firstName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                    <input
                      type="text"
                      required
                      value={adminForm.lastName}
                      onChange={(e) => setAdminForm({ ...adminForm, lastName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    required
                    value={adminForm.email}
                    onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
                  <input
                    type="tel"
                    required
                    value={adminForm.mobileNumber}
                    onChange={(e) => setAdminForm({ ...adminForm, mobileNumber: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    required
                    value={adminForm.password}
                    onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture (Optional)</label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={(e) => handleFileChange(e, true)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700"
                  />
                </div>
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">Location Coordinates (Optional)</label>
                    <button
                      type="button"
                      onClick={() => getCurrentLocation(true)}
                      disabled={gettingLocation}
                      className="flex items-center gap-2 px-3 py-1.5 bg-sky-100 text-sky-700 rounded-lg hover:bg-sky-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      <Navigation className="w-4 h-4" />
                      {gettingLocation ? 'Getting...' : 'Get Current Location'}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Latitude</label>
                      <input
                        type="number"
                        step="any"
                        value={adminForm.latitude}
                        onChange={(e) => setAdminForm({ ...adminForm, latitude: e.target.value })}
                        placeholder="e.g., 28.6139"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Longitude</label>
                      <input
                        type="number"
                        step="any"
                        value={adminForm.longitude}
                        onChange={(e) => setAdminForm({ ...adminForm, longitude: e.target.value })}
                        placeholder="e.g., 77.2090"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                      />
                    </div>
                  </div>
                  {adminForm.latitude && adminForm.longitude && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-sky-600">
                      <MapPin className="w-3 h-3" />
                      <span>Location: {adminForm.latitude}, {adminForm.longitude}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-3 justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateAdmin(false);
                      resetAdminForm();
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Create Admin'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Create User</h2>
                <button
                  onClick={() => {
                    setShowCreateUser(false);
                    resetUserForm();
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">User Type</label>
                  <select
                    required
                    value={userForm.userType}
                    onChange={(e) => setUserForm({ ...userForm, userType: e.target.value as UserType })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                  >
                    {USER_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                    <input
                      type="text"
                      required
                      value={userForm.firstName}
                      onChange={(e) => setUserForm({ ...userForm, firstName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                    <input
                      type="text"
                      required
                      value={userForm.lastName}
                      onChange={(e) => setUserForm({ ...userForm, lastName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    required
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
                  <input
                    type="tel"
                    required
                    value={userForm.mobileNumber}
                    onChange={(e) => setUserForm({ ...userForm, mobileNumber: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    required
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
                {userForm.userType !== 'ADMIN' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">District *</label>
                    <input
                      type="text"
                      required
                      value={userForm.district}
                      onChange={(e) => setUserForm({ ...userForm, district: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                      placeholder="Enter district name"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture (Optional)</label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={(e) => handleFileChange(e, false)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700"
                  />
                </div>
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">Location Coordinates (Optional)</label>
                    <button
                      type="button"
                      onClick={() => getCurrentLocation(false)}
                      disabled={gettingLocation}
                      className="flex items-center gap-2 px-3 py-1.5 bg-sky-100 text-sky-700 rounded-lg hover:bg-sky-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      <Navigation className="w-4 h-4" />
                      {gettingLocation ? 'Getting...' : 'Get Current Location'}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Latitude</label>
                      <input
                        type="number"
                        step="any"
                        value={userForm.latitude}
                        onChange={(e) => setUserForm({ ...userForm, latitude: e.target.value })}
                        placeholder="e.g., 28.6139"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Longitude</label>
                      <input
                        type="number"
                        step="any"
                        value={userForm.longitude}
                        onChange={(e) => setUserForm({ ...userForm, longitude: e.target.value })}
                        placeholder="e.g., 77.2090"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                      />
                    </div>
                  </div>
                  {userForm.latitude && userForm.longitude && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-sky-600">
                      <MapPin className="w-3 h-3" />
                      <span>Location: {userForm.latitude}, {userForm.longitude}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-3 justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateUser(false);
                      resetUserForm();
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Create User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {showUserDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">User Details</h2>
                <div className="flex items-center gap-3">
                  {selectedUser && (
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={includePassword}
                        onChange={(e) => {
                          const newValue = e.target.checked;
                          setIncludePassword(newValue);
                          // Immediately fetch with the new includePassword value
                          handleViewUserDetails(selectedUser.userId, newValue);
                        }}
                        disabled={loadingUserDetails}
                        className="rounded"
                      />
                      Include Password
                    </label>
                  )}
                  <button
                    onClick={() => {
                      setShowUserDetails(false);
                      setSelectedUser(null);
                      setIncludePassword(false);
                      setLoadingUserDetails(false);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              {loadingUserDetails ? (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <Skeleton variant="circular" width={128} height={128} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {Array.from({ length: 8 }).map((_, index) => (
                      <div key={index}>
                        <Skeleton variant="text" width="40%" height={14} className="mb-2" />
                        <Skeleton variant="text" width="80%" height={20} />
                      </div>
                    ))}
                  </div>
                </div>
              ) : selectedUser ? (
                <div className="space-y-4">
                  {selectedUser.profilePicture && (
                  <div className="flex justify-center">
                    <img
                      src={selectedUser.profilePicture}
                      alt={`${selectedUser.firstName} ${selectedUser.lastName}`}
                      className="w-32 h-32 rounded-full object-cover border-4 border-sky-200"
                    />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">User ID</label>
                    <p className="text-gray-800 font-semibold">{selectedUser.userId}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Role</label>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(selectedUser.role)}`}>
                      {selectedUser.role.replace('_', ' ')}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">First Name</label>
                    <p className="text-gray-800">{selectedUser.firstName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Last Name</label>
                    <p className="text-gray-800">{selectedUser.lastName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                    <p className="text-gray-800">{selectedUser.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Mobile Number</label>
                    <p className="text-gray-800">{selectedUser.mobileNumber}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${selectedUser.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {selectedUser.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Created At</label>
                    <p className="text-gray-800">{new Date(selectedUser.createdAt).toLocaleString()}</p>
                  </div>
                  {selectedUser.latitude !== undefined && selectedUser.longitude !== undefined && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Latitude</label>
                        <p className="text-gray-800">{selectedUser.latitude}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Longitude</label>
                        <p className="text-gray-800">{selectedUser.longitude}</p>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-500 mb-1">Location</label>
                        <div className="flex items-center gap-2 text-sky-600">
                          <MapPin className="w-4 h-4" />
                          <a
                            href={`https://www.google.com/maps?q=${selectedUser.latitude},${selectedUser.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm hover:underline"
                          >
                            View on Google Maps
                          </a>
                        </div>
                      </div>
                    </>
                  )}
                  {includePassword && selectedUser.password && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Password</label>
                        <p className="text-gray-800 font-mono bg-gray-100 px-2 py-1 rounded">{selectedUser.password}</p>
                      </div>
                      {selectedUser.encryptedPassword && (
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Encrypted Password</label>
                          <p className="text-gray-800 font-mono text-xs bg-gray-100 px-2 py-1 rounded break-all">{selectedUser.encryptedPassword}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => {
                      setShowUserDetails(false);
                      setSelectedUser(null);
                      setIncludePassword(false);
                      setLoadingUserDetails(false);
                    }}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

