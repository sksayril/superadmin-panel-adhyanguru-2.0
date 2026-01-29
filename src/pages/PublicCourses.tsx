import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ToastContainer';
import { api } from '../services/api';
import { BookMarked, Plus, Edit, Trash2, Eye, Search, X, ListChecks, Image as ImageIcon } from 'lucide-react';
import Skeleton from '../components/Skeleton';
import ConfirmDialog from '../components/ConfirmDialog';

interface Course {
  _id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  price: number;
  isActive: boolean;
  createdBy?: {
    _id: string;
    userId: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function PublicCourses() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<boolean | undefined>(undefined);
  
  // Modals
  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [showEditCourse, setShowEditCourse] = useState(false);
  const [showDeleteCourseConfirm, setShowDeleteCourseConfirm] = useState(false);
  const [showCourseDetails, setShowCourseDetails] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [deleteCourseTarget, setDeleteCourseTarget] = useState<{ id: string; title: string } | null>(null);
  
  // Forms
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    price: 0,
    thumbnail: null as File | null,
    isActive: true,
  });

  useEffect(() => {
    if (token) {
      fetchCourses();
    }
  }, [token, filterActive]);

  const fetchCourses = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await api.getAllCourses(token, filterActive);
      if (response.success) {
        setCourses(response.data);
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to fetch courses', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setLoading(true);
    try {
      const response = await api.createCourse(
        token,
        courseForm.title,
        courseForm.price,
        courseForm.description || undefined,
        courseForm.thumbnail || undefined
      );
      if (response.success) {
        showToast('Course created successfully!', 'success');
        setShowCreateCourse(false);
        resetCourseForm();
        fetchCourses();
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to create course', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedCourse) return;
    setLoading(true);
    try {
      const response = await api.updateCourse(
        token,
        selectedCourse._id,
        courseForm.title,
        courseForm.description !== undefined ? courseForm.description : undefined,
        courseForm.price,
        courseForm.isActive,
        courseForm.thumbnail || undefined
      );
      if (response.success) {
        showToast('Course updated successfully!', 'success');
        setShowEditCourse(false);
        resetCourseForm();
        setSelectedCourse(null);
        fetchCourses();
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to update course', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async () => {
    if (!token || !deleteCourseTarget) return;
    setLoading(true);
    try {
      await api.deleteCourse(token, deleteCourseTarget.id);
      showToast('Course deleted successfully!', 'success');
      setShowDeleteCourseConfirm(false);
      setDeleteCourseTarget(null);
      fetchCourses();
    } catch (error: any) {
      showToast(error.message || 'Failed to delete course', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEditCourse = (course: Course) => {
    setSelectedCourse(course);
    setCourseForm({
      title: course.title,
      description: course.description || '',
      price: course.price,
      thumbnail: null,
      isActive: course.isActive,
    });
    setShowEditCourse(true);
  };

  const handleViewCourseDetails = async (courseId: string) => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await api.getCourseById(token, courseId);
      if (response.success) {
        setSelectedCourse(response.data);
        setShowCourseDetails(true);
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to fetch course details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleViewChapters = (course: Course) => {
    navigate(`/course-chapters/${course._id}`);
  };

  const resetCourseForm = () => {
    setCourseForm({
      title: '',
      description: '',
      price: 0,
      thumbnail: null,
      isActive: true,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setCourseForm({ ...courseForm, thumbnail: file });
      showToast('File selected successfully', 'success');
    }
  };

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (course.description && course.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Public Courses</h1>
          <p className="text-gray-600">Manage public courses and their chapters</p>
        </div>
        <button
          onClick={() => {
            resetCourseForm();
            setShowCreateCourse(true);
          }}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors disabled:opacity-50"
        >
          <Plus className="w-5 h-5" />
          Create Course
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterActive(undefined)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterActive === undefined
                  ? 'bg-sky-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterActive(true)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterActive === true
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilterActive(false)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterActive === false
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Inactive
            </button>
          </div>
        </div>
      </div>

      {/* Courses List */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-sky-400 to-sky-500 text-white">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">Thumbnail</th>
                <th className="px-6 py-4 text-left font-semibold">Title</th>
                <th className="px-6 py-4 text-left font-semibold">Description</th>
                <th className="px-6 py-4 text-left font-semibold">Price</th>
                <th className="px-6 py-4 text-left font-semibold">Status</th>
                <th className="px-6 py-4 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="px-6 py-4">
                      <Skeleton variant="rectangular" width={60} height={60} className="rounded-lg" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton variant="text" width={200} />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton variant="text" width={300} />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton variant="text" width={100} />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton variant="rectangular" width={60} height={32} className="rounded-lg" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Skeleton variant="rectangular" width={60} height={32} className="rounded-lg" />
                        <Skeleton variant="rectangular" width={60} height={32} className="rounded-lg" />
                        <Skeleton variant="rectangular" width={60} height={32} className="rounded-lg" />
                        <Skeleton variant="rectangular" width={60} height={32} className="rounded-lg" />
                      </div>
                    </td>
                  </tr>
                ))
              ) : filteredCourses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No courses found
                  </td>
                </tr>
              ) : (
                filteredCourses.map((course) => (
                  <tr key={course._id} className="border-b border-gray-100 hover:bg-sky-50 transition">
                    <td className="px-6 py-4">
                      {course.thumbnail ? (
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-16 h-16 object-cover rounded"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-800">{course.title}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {course.description ? (course.description.length > 50 ? `${course.description.substring(0, 50)}...` : course.description) : '-'}
                    </td>
                    <td className="px-6 py-4 text-gray-800 font-semibold">₹{course.price.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          course.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {course.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewChapters(course)}
                          className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm"
                          title="View Chapters"
                        >
                          <ListChecks className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleViewCourseDetails(course._id)}
                          className="px-3 py-1 bg-sky-100 text-sky-700 rounded-lg hover:bg-sky-200 transition-colors text-sm"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditCourse(course)}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteCourseTarget({ id: course._id, title: course.title });
                            setShowDeleteCourseConfirm(true);
                          }}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Course Modal */}
      {showCreateCourse && (
        <CourseModal
          title="Create Course"
          form={courseForm}
          setForm={setCourseForm}
          onSubmit={handleCreateCourse}
          onClose={() => {
            setShowCreateCourse(false);
            resetCourseForm();
          }}
          loading={loading}
          onFileChange={handleFileChange}
        />
      )}

      {/* Edit Course Modal */}
      {showEditCourse && selectedCourse && (
        <CourseModal
          title="Edit Course"
          form={courseForm}
          setForm={setCourseForm}
          onSubmit={handleUpdateCourse}
          onClose={() => {
            setShowEditCourse(false);
            resetCourseForm();
            setSelectedCourse(null);
          }}
          loading={loading}
          onFileChange={handleFileChange}
          existingCourse={selectedCourse}
        />
      )}

      {/* Delete Course Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteCourseConfirm}
        title="Delete Course"
        message={`Are you sure you want to delete "${deleteCourseTarget?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteCourse}
        onCancel={() => {
          setShowDeleteCourseConfirm(false);
          setDeleteCourseTarget(null);
        }}
      />

      {/* Course Details Modal */}
      {showCourseDetails && selectedCourse && (
        <CourseDetailsModal
          course={selectedCourse}
          onClose={() => {
            setShowCourseDetails(false);
            setSelectedCourse(null);
          }}
        />
      )}
    </div>
  );
}

// Course Modal Component
interface CourseModalProps {
  title: string;
  form: {
    title: string;
    description: string;
    price: number;
    thumbnail: File | null;
    isActive: boolean;
  };
  setForm: (form: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  loading: boolean;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  existingCourse?: Course;
}

function CourseModal({
  title,
  form,
  setForm,
  onSubmit,
  onClose,
  loading,
  onFileChange,
  existingCourse,
}: CourseModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                placeholder="Enter course title..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                placeholder="Enter course description..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Thumbnail (Optional, Max 5MB)</label>
              {existingCourse?.thumbnail && !form.thumbnail && (
                <div className="mb-2">
                  <img
                    src={existingCourse.thumbnail}
                    alt="Current"
                    className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                  />
                </div>
              )}
              <input
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={onFileChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="rounded"
                />
                Active
              </label>
            </div>
            <div className="flex gap-3 justify-end pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Course Details Modal
interface CourseDetailsModalProps {
  course: Course;
  onClose: () => void;
}

function CourseDetailsModal({ course, onClose }: CourseDetailsModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-sky-400 to-sky-600 p-3 rounded-lg">
                <BookMarked className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Course Details</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-4">
            {course.thumbnail && (
              <div className="flex justify-center">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-48 h-48 object-cover rounded-lg border-4 border-sky-200"
                />
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Title</label>
                <p className="text-gray-800 font-semibold">{course.title}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Price</label>
                <p className="text-gray-800 font-semibold">₹{course.price.toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    course.isActive
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {course.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              {course.description && (
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-500 mb-1">Description</label>
                  <p className="text-gray-800">{course.description}</p>
                </div>
              )}
              {course.createdBy && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Created By</label>
                  <p className="text-gray-800">
                    {course.createdBy.firstName} {course.createdBy.lastName}
                  </p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Created At</label>
                <p className="text-gray-800">{new Date(course.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Updated At</label>
                <p className="text-gray-800">{new Date(course.updatedAt).toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

