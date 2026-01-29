import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ToastContainer';
import { api } from '../services/api';
import { BookOpen, Plus, Edit, Trash2, Eye, Search, X, ListChecks } from 'lucide-react';
import Skeleton from '../components/Skeleton';
import ConfirmDialog from '../components/ConfirmDialog';

interface MainCategory {
  _id: string;
  name: string;
}

interface SubCategory {
  _id: string;
  name: string;
  mainCategory: {
    _id: string;
    name: string;
  };
}

interface Board {
  _id: string;
  name: string;
  code?: string;
}

interface Subject {
  _id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  mainCategory: {
    _id: string;
    name: string;
  };
  subCategory: {
    _id: string;
    name: string;
  };
  board?: {
    _id: string;
    name: string;
    code?: string;
  } | null;
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

export default function Subjects() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [mainCategories, setMainCategories] = useState<MainCategory[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [boards, setBoards] = useState<Board[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<boolean | undefined>(undefined);
  const [filterMainCategory, setFilterMainCategory] = useState<string>('');
  const [filterSubCategory, setFilterSubCategory] = useState<string>('');
  
  // Subject Modals
  const [showCreateSubject, setShowCreateSubject] = useState(false);
  const [showEditSubject, setShowEditSubject] = useState(false);
  const [showDeleteSubjectConfirm, setShowDeleteSubjectConfirm] = useState(false);
  const [showSubjectDetails, setShowSubjectDetails] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [deleteSubjectTarget, setDeleteSubjectTarget] = useState<{ id: string; title: string } | null>(null);
  
  // Forms
  const [subjectForm, setSubjectForm] = useState({
    title: '',
    description: '',
    mainCategoryId: '',
    subCategoryId: '',
    boardId: '',
    thumbnail: null as File | null,
    isActive: true,
  });

  useEffect(() => {
    if (token) {
      fetchSubjects();
      fetchMainCategories();
      fetchSubCategories();
      fetchBoards();
    }
  }, [token, filterActive, filterMainCategory, filterSubCategory]);

  const fetchSubjects = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await api.getAllSubjects(
        token,
        filterMainCategory || undefined,
        filterSubCategory || undefined,
        filterActive
      );
      if (response.success) {
        setSubjects(response.data);
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to fetch subjects', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchMainCategories = async () => {
    if (!token) return;
    try {
      const response = await api.getAllMainCategories(token, true);
      if (response.success) {
        setMainCategories(response.data);
      }
    } catch (error: any) {
      // Silent fail for filters
    }
  };

  const fetchSubCategories = async () => {
    if (!token) return;
    try {
      const response = await api.getAllSubCategories(token, filterMainCategory || undefined, true);
      if (response.success) {
        setSubCategories(response.data);
      }
    } catch (error: any) {
      // Silent fail for filters
    }
  };

  const fetchBoards = async () => {
    if (!token) return;
    try {
      const response = await api.getAllBoards(token, true);
      if (response.success) {
        setBoards(response.data);
      }
    } catch (error: any) {
      // Silent fail for filters
    }
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (!subjectForm.mainCategoryId || !subjectForm.subCategoryId) {
      showToast('Please select main category and sub category', 'error');
      return;
    }
    setLoading(true);
    try {
      const response = await api.createSubject(
        token,
        subjectForm.title,
        subjectForm.mainCategoryId,
        subjectForm.subCategoryId,
        subjectForm.description || undefined,
        subjectForm.thumbnail || undefined,
        subjectForm.boardId || undefined,
        subjectForm.isActive
      );
      if (response.success) {
        showToast('Subject created successfully!', 'success');
        setShowCreateSubject(false);
        resetSubjectForm();
        fetchSubjects();
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to create subject', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedSubject) return;
    setLoading(true);
    try {
      const response = await api.updateSubject(
        token,
        selectedSubject._id,
        subjectForm.title || undefined,
        subjectForm.description !== undefined ? subjectForm.description : undefined,
        subjectForm.mainCategoryId || undefined,
        subjectForm.subCategoryId || undefined,
        subjectForm.boardId === '' ? null : (subjectForm.boardId || undefined),
        subjectForm.isActive,
        subjectForm.thumbnail || undefined
      );
      if (response.success) {
        showToast('Subject updated successfully!', 'success');
        setShowEditSubject(false);
        resetSubjectForm();
        setSelectedSubject(null);
        fetchSubjects();
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to update subject', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubject = async () => {
    if (!token || !deleteSubjectTarget) return;
    setLoading(true);
    try {
      await api.deleteSubject(token, deleteSubjectTarget.id);
      showToast('Subject deleted successfully!', 'success');
      setShowDeleteSubjectConfirm(false);
      setDeleteSubjectTarget(null);
      fetchSubjects();
    } catch (error: any) {
      showToast(error.message || 'Failed to delete subject', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubject = (subject: Subject) => {
    setSelectedSubject(subject);
    setSubjectForm({
      title: subject.title,
      description: subject.description || '',
      mainCategoryId: subject.mainCategory._id,
      subCategoryId: subject.subCategory._id,
      boardId: subject.board?._id || '',
      thumbnail: null,
      isActive: subject.isActive,
    });
    setShowEditSubject(true);
  };

  const handleViewSubjectDetails = async (id: string) => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await api.getSubjectById(token, id);
      if (response.success) {
        setSelectedSubject(response.data);
        setShowSubjectDetails(true);
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to fetch subject details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleViewChapters = (subject: Subject) => {
    navigate(`/chapters/${subject._id}`);
  };


  const resetSubjectForm = () => {
    setSubjectForm({
      title: '',
      description: '',
      mainCategoryId: '',
      subCategoryId: '',
      boardId: '',
      thumbnail: null,
      isActive: true,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'thumbnail') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (type === 'thumbnail') {
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) {
          showToast('Please upload a valid image file (JPEG, PNG, GIF, or WebP)', 'error');
          return;
        }
      if (file.size > 5 * 1024 * 1024) {
        showToast('File size must be less than 5MB', 'error');
        return;
      }
      setSubjectForm({ ...subjectForm, thumbnail: file });
      }
      showToast('File selected successfully', 'success');
    }
  };

  const filteredSubjects = subjects.filter(
    (subject) =>
      subject.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (subject.description && subject.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      subject.mainCategory.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.subCategory.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (subject.board && subject.board.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );


  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Subjects Management</h1>
          <p className="text-gray-600">Manage subjects and their chapters</p>
        </div>
        <button
          onClick={() => {
            resetSubjectForm();
            setShowCreateSubject(true);
          }}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors disabled:opacity-50"
        >
          <Plus className="w-5 h-5" />
          Create Subject
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search subjects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
            />
          </div>
          <select
            value={filterMainCategory}
            onChange={(e) => {
              setFilterMainCategory(e.target.value);
              setFilterSubCategory('');
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
          >
            <option value="">All Main Categories</option>
            {mainCategories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
          <select
            value={filterSubCategory}
            onChange={(e) => setFilterSubCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
            disabled={!filterMainCategory}
          >
            <option value="">All Sub Categories</option>
            {subCategories
              .filter((sub) => !filterMainCategory || sub.mainCategory._id === filterMainCategory)
              .map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
          </select>
          <select
            value={filterActive === undefined ? 'all' : filterActive.toString()}
            onChange={(e) => {
              const value = e.target.value;
              setFilterActive(value === 'all' ? undefined : value === 'true');
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
          >
            <option value="all">All Status</option>
            <option value="true">Active Only</option>
            <option value="false">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Subjects List */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-sky-400 to-sky-500 text-white">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">Thumbnail</th>
                <th className="px-6 py-4 text-left font-semibold">Title</th>
                <th className="px-6 py-4 text-left font-semibold">Category</th>
                <th className="px-6 py-4 text-left font-semibold">Board</th>
                <th className="px-6 py-4 text-left font-semibold">Status</th>
                <th className="px-6 py-4 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="px-6 py-4">
                      <Skeleton variant="rectangular" width={60} height={60} className="rounded" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton variant="text" width={200} height={20} />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton variant="text" width={150} height={20} />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton variant="text" width={100} height={20} />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton variant="rectangular" width={80} height={24} className="rounded-full" />
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
              ) : filteredSubjects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No subjects found
                  </td>
                </tr>
              ) : (
                filteredSubjects.map((subject) => (
                  <tr key={subject._id} className="border-b border-gray-100 hover:bg-sky-50 transition">
                    <td className="px-6 py-4">
                      {subject.thumbnail ? (
                        <img
                          src={subject.thumbnail}
                          alt={subject.title}
                          className="w-16 h-16 object-cover rounded"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                          <BookOpen className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-800">{subject.title}</div>
                      {subject.description && (
                        <div className="text-sm text-gray-500 line-clamp-1">{subject.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      <div className="text-sm">{subject.mainCategory.name}</div>
                      <div className="text-xs text-gray-500">→ {subject.subCategory.name}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {subject.board ? (
                        <span className="px-2 py-1 bg-sky-100 text-sky-700 rounded text-sm font-medium">
                          {subject.board.name}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          subject.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {subject.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewChapters(subject)}
                          className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm"
                          title="View Chapters"
                        >
                          <ListChecks className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleViewSubjectDetails(subject._id)}
                          className="px-3 py-1 bg-sky-100 text-sky-700 rounded-lg hover:bg-sky-200 transition-colors text-sm"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditSubject(subject)}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteSubjectTarget({ id: subject._id, title: subject.title });
                            setShowDeleteSubjectConfirm(true);
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

      {/* Create Subject Modal */}
      {showCreateSubject && (
        <SubjectModal
          title="Create Subject"
          form={subjectForm}
          setForm={setSubjectForm}
          onSubmit={handleCreateSubject}
          onClose={() => {
            setShowCreateSubject(false);
            resetSubjectForm();
          }}
          loading={loading}
          onFileChange={(e) => handleFileChange(e, 'thumbnail')}
          mainCategories={mainCategories}
          subCategories={subCategories.filter((sub) => sub.mainCategory._id === subjectForm.mainCategoryId)}
          boards={boards}
        />
      )}

      {/* Edit Subject Modal */}
      {showEditSubject && selectedSubject && (
        <SubjectModal
          title="Edit Subject"
          form={subjectForm}
          setForm={setSubjectForm}
          onSubmit={handleUpdateSubject}
          onClose={() => {
            setShowEditSubject(false);
            resetSubjectForm();
            setSelectedSubject(null);
          }}
          loading={loading}
          onFileChange={(e) => handleFileChange(e, 'thumbnail')}
          mainCategories={mainCategories}
          subCategories={subCategories.filter((sub) => sub.mainCategory._id === subjectForm.mainCategoryId)}
          boards={boards}
          existingThumbnail={selectedSubject.thumbnail}
        />
      )}

      {/* Delete Subject Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteSubjectConfirm}
        title="Delete Subject"
        message={`Are you sure you want to delete "${deleteSubjectTarget?.title}"? This action cannot be undone. If this subject has chapters, you will need to delete them first.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteSubject}
        onCancel={() => {
          setShowDeleteSubjectConfirm(false);
          setDeleteSubjectTarget(null);
        }}
      />

      {/* Subject Details Modal */}
      {showSubjectDetails && selectedSubject && (
        <SubjectDetailsModal
          subject={selectedSubject}
          onClose={() => {
            setShowSubjectDetails(false);
            setSelectedSubject(null);
          }}
        />
      )}

    </div>
  );
}

// Subject Modal Component
interface SubjectModalProps {
  title: string;
  form: {
    title: string;
    description: string;
    mainCategoryId: string;
    subCategoryId: string;
    boardId: string;
    thumbnail: File | null;
    isActive: boolean;
  };
  setForm: (form: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  loading: boolean;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  mainCategories: MainCategory[];
  subCategories: SubCategory[];
  boards: Board[];
  existingThumbnail?: string;
}

function SubjectModal({
  title,
  form,
  setForm,
  onSubmit,
  onClose,
  loading,
  onFileChange,
  mainCategories,
  subCategories,
  boards,
  existingThumbnail,
}: SubjectModalProps) {
  const { token } = useAuth();
  const [localSubCategories, setLocalSubCategories] = useState<SubCategory[]>(subCategories);

  useEffect(() => {
    setLocalSubCategories(subCategories);
  }, [subCategories]);

  const handleMainCategoryChange = async (mainCategoryId: string) => {
    setForm({ ...form, mainCategoryId, subCategoryId: '' });
    if (mainCategoryId && token) {
      try {
        const response = await api.getAllSubCategories(token, mainCategoryId, true);
        if (response.success) {
          setLocalSubCategories(response.data);
        }
      } catch (error) {
        // Silent fail
      }
    } else {
      setLocalSubCategories([]);
    }
  };

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
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                placeholder="Enter subject description..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Main Category <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={form.mainCategoryId}
                  onChange={(e) => handleMainCategoryChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                >
                  <option value="">Select Main Category</option>
                  {mainCategories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sub Category <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={form.subCategoryId}
                  onChange={(e) => setForm({ ...form, subCategoryId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                  disabled={!form.mainCategoryId}
                >
                  <option value="">Select Sub Category</option>
                  {localSubCategories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Board (Optional)</label>
              <select
                value={form.boardId}
                onChange={(e) => setForm({ ...form, boardId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
              >
                <option value="">No Board</option>
                {boards.map((board) => (
                  <option key={board._id} value={board._id}>
                    {board.name} {board.code && `(${board.code})`}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Thumbnail (Optional)</label>
              {existingThumbnail && !form.thumbnail && (
                <div className="mb-2">
                  <img
                    src={existingThumbnail}
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
              <p className="mt-1 text-xs text-gray-500">JPEG, PNG, GIF, or WebP. Max 5MB</p>
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

// Subject Details Modal
interface SubjectDetailsModalProps {
  subject: Subject;
  onClose: () => void;
}

function SubjectDetailsModal({ subject, onClose }: SubjectDetailsModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-sky-400 to-sky-600 p-3 rounded-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Subject Details</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-4">
            {subject.thumbnail && (
              <div className="flex justify-center">
                <img
                  src={subject.thumbnail}
                  alt={subject.title}
                  className="w-48 h-48 object-cover rounded-lg border-4 border-sky-200"
                />
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Title</label>
                <p className="text-gray-800 font-semibold text-lg">{subject.title}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    subject.isActive
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {subject.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              {subject.description && (
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-500 mb-1">Description</label>
                  <p className="text-gray-800">{subject.description}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Main Category</label>
                <p className="text-gray-800 font-semibold">{subject.mainCategory.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Sub Category</label>
                <p className="text-gray-800 font-semibold">{subject.subCategory.name}</p>
              </div>
              {subject.board && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Board</label>
                  <p className="text-gray-800 font-semibold">
                    <span className="px-2 py-1 bg-sky-100 text-sky-700 rounded text-sm">
                      {subject.board.name} {subject.board.code && `(${subject.board.code})`}
                    </span>
                  </p>
                </div>
              )}
              {subject.createdBy && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Created By</label>
                  <p className="text-gray-800">
                    {subject.createdBy.firstName} {subject.createdBy.lastName}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">({subject.createdBy.userId})</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Created At</label>
                <p className="text-gray-800">{new Date(subject.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Updated At</label>
                <p className="text-gray-800">{new Date(subject.updatedAt).toLocaleString()}</p>
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


