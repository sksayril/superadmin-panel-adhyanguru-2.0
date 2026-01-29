import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ToastContainer';
import { api } from '../services/api';
import { Image, Plus, Edit, Trash2, Eye, Search, X, ArrowUpDown } from 'lucide-react';
import Skeleton, { SkeletonCard } from '../components/Skeleton';
import ConfirmDialog from '../components/ConfirmDialog';

interface Thumbnail {
  _id: string;
  title: string;
  image: string;
  description?: string;
  order: number;
  isActive: boolean;
  createdBy?: {
    _id: string;
    userId: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt?: string;
}

export default function Thumbnails() {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [thumbnails, setThumbnails] = useState<Thumbnail[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<boolean | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState('order');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Modals
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  // Selected items
  const [selectedThumbnail, setSelectedThumbnail] = useState<Thumbnail | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  
  // Form
  const [thumbnailForm, setThumbnailForm] = useState({
    title: '',
    description: '',
    order: 0,
    image: null as File | null,
    isActive: true,
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      fetchThumbnails();
    }
  }, [token, page, filterActive, sortBy, sortOrder]);

  const fetchThumbnails = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await api.getAllThumbnails(
        token,
        page,
        20,
        filterActive,
        sortBy,
        sortOrder
      );
      if (response.success) {
        setThumbnails(response.data.thumbnails);
        setTotalPages(response.data.pagination.pages);
        setTotal(response.data.pagination.total);
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to fetch thumbnails', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateThumbnail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !thumbnailForm.image) {
      showToast('Please select an image', 'error');
      return;
    }
    setLoading(true);
    try {
      const response = await api.createThumbnail(
        token,
        thumbnailForm.title,
        thumbnailForm.image,
        thumbnailForm.description || undefined,
        thumbnailForm.order || undefined
      );
      if (response.success) {
        showToast('Thumbnail created successfully!', 'success');
        setShowCreate(false);
        resetThumbnailForm();
        fetchThumbnails();
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to create thumbnail', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateThumbnail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedThumbnail) return;
    setLoading(true);
    try {
      const response = await api.updateThumbnail(
        token,
        selectedThumbnail._id,
        thumbnailForm.title || undefined,
        thumbnailForm.image || undefined,
        thumbnailForm.description !== undefined ? thumbnailForm.description : undefined,
        thumbnailForm.order !== undefined ? thumbnailForm.order : undefined,
        thumbnailForm.isActive
      );
      if (response.success) {
        showToast('Thumbnail updated successfully!', 'success');
        setShowEdit(false);
        resetThumbnailForm();
        setSelectedThumbnail(null);
        fetchThumbnails();
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to update thumbnail', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!token || !deleteTarget) return;
    setLoading(true);
    try {
      await api.deleteThumbnail(token, deleteTarget.id);
      showToast('Thumbnail deleted successfully!', 'success');
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
      fetchThumbnails();
    } catch (error: any) {
      showToast(error.message || 'Failed to delete thumbnail', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (thumbnail: Thumbnail) => {
    setSelectedThumbnail(thumbnail);
    setThumbnailForm({
      title: thumbnail.title,
      description: thumbnail.description || '',
      order: thumbnail.order,
      image: null,
      isActive: thumbnail.isActive,
    });
    setImagePreview(thumbnail.image);
    setShowEdit(true);
  };

  const handleViewDetails = async (id: string) => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await api.getThumbnailById(token, id);
      if (response.success) {
        setSelectedThumbnail(response.data);
        setShowDetails(true);
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to fetch thumbnail details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetThumbnailForm = () => {
    setThumbnailForm({
      title: '',
      description: '',
      order: 0,
      image: null,
      isActive: true,
    });
    setImagePreview(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setThumbnailForm({ ...thumbnailForm, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredThumbnails = thumbnails.filter((thumbnail) =>
    thumbnail.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Thumbnails</h1>
          <p className="text-gray-600">Manage thumbnails for your application</p>
        </div>
        <button
          onClick={() => {
            resetThumbnailForm();
            setShowCreate(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-sky-500 to-sky-600 text-white rounded-lg hover:from-sky-600 hover:to-sky-700 transition-all shadow-md hover:shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Create Thumbnail
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search thumbnails..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={filterActive === undefined ? 'all' : filterActive ? 'active' : 'inactive'}
              onChange={(e) => {
                const value = e.target.value;
                setFilterActive(value === 'all' ? undefined : value === 'active');
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order as 'asc' | 'desc');
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
            >
              <option value="order-asc">Order: Low to High</option>
              <option value="order-desc">Order: High to Low</option>
              <option value="title-asc">Title: A to Z</option>
              <option value="title-desc">Title: Z to A</option>
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
            </select>
          </div>
        </div>

        {loading && thumbnails.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filteredThumbnails.length === 0 ? (
          <div className="text-center py-12">
            <Image className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No thumbnails found</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredThumbnails.map((thumbnail) => (
                <div
                  key={thumbnail._id}
                  className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="relative aspect-video bg-gray-100">
                    <img
                      src={thumbnail.image}
                      alt={thumbnail.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x225?text=Image+Not+Found';
                      }}
                    />
                    <div className="absolute top-2 right-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          thumbnail.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {thumbnail.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 mb-1 truncate">{thumbnail.title}</h3>
                    {thumbnail.description && (
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{thumbnail.description}</p>
                    )}
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <span>Order: {thumbnail.order}</span>
                      <span>{new Date(thumbnail.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewDetails(thumbnail._id)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-sky-50 text-sky-600 rounded-lg hover:bg-sky-100 transition-colors text-sm"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                      <button
                        onClick={() => handleEdit(thumbnail)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setDeleteTarget({ id: thumbnail._id, title: thumbnail.title });
                          setShowDeleteConfirm(true);
                        }}
                        className="flex items-center justify-center gap-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, total)} of {total} thumbnails
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 text-sm text-gray-700">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">Create Thumbnail</h2>
              <button
                onClick={() => {
                  setShowCreate(false);
                  resetThumbnailForm();
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <form onSubmit={handleCreateThumbnail} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={thumbnailForm.title}
                  onChange={(e) => setThumbnailForm({ ...thumbnailForm, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Image <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleImageChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">JPEG, PNG, GIF, or WebP. Max 5MB</p>
                {imagePreview && (
                  <div className="mt-4">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full max-w-md h-48 object-cover rounded-lg border border-gray-200"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  value={thumbnailForm.description}
                  onChange={(e) => setThumbnailForm({ ...thumbnailForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Order</label>
                <input
                  type="number"
                  value={thumbnailForm.order}
                  onChange={(e) => setThumbnailForm({ ...thumbnailForm, order: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
                  min="0"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="createActive"
                  checked={thumbnailForm.isActive}
                  onChange={(e) => setThumbnailForm({ ...thumbnailForm, isActive: e.target.checked })}
                  className="w-4 h-4 text-sky-600 border-gray-300 rounded focus:ring-sky-500"
                />
                <label htmlFor="createActive" className="text-sm font-medium text-gray-700">
                  Active
                </label>
              </div>

              <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreate(false);
                    resetThumbnailForm();
                  }}
                  className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-sky-500 to-sky-600 text-white rounded-lg hover:from-sky-600 hover:to-sky-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Thumbnail'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEdit && selectedThumbnail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">Edit Thumbnail</h2>
              <button
                onClick={() => {
                  setShowEdit(false);
                  resetThumbnailForm();
                  setSelectedThumbnail(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <form onSubmit={handleUpdateThumbnail} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={thumbnailForm.title}
                  onChange={(e) => setThumbnailForm({ ...thumbnailForm, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Image (Leave empty to keep current)</label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleImageChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
                />
                <p className="mt-1 text-xs text-gray-500">JPEG, PNG, GIF, or WebP. Max 5MB</p>
                {imagePreview && (
                  <div className="mt-4">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full max-w-md h-48 object-cover rounded-lg border border-gray-200"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  value={thumbnailForm.description}
                  onChange={(e) => setThumbnailForm({ ...thumbnailForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Order</label>
                <input
                  type="number"
                  value={thumbnailForm.order}
                  onChange={(e) => setThumbnailForm({ ...thumbnailForm, order: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
                  min="0"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="editActive"
                  checked={thumbnailForm.isActive}
                  onChange={(e) => setThumbnailForm({ ...thumbnailForm, isActive: e.target.checked })}
                  className="w-4 h-4 text-sky-600 border-gray-300 rounded focus:ring-sky-500"
                />
                <label htmlFor="editActive" className="text-sm font-medium text-gray-700">
                  Active
                </label>
              </div>

              <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowEdit(false);
                    resetThumbnailForm();
                    setSelectedThumbnail(null);
                  }}
                  className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-sky-500 to-sky-600 text-white rounded-lg hover:from-sky-600 hover:to-sky-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update Thumbnail'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetails && selectedThumbnail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">Thumbnail Details</h2>
              <button
                onClick={() => {
                  setShowDetails(false);
                  setSelectedThumbnail(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <img
                  src={selectedThumbnail.image}
                  alt={selectedThumbnail.title}
                  className="w-full h-64 object-cover rounded-lg border border-gray-200"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x225?text=Image+Not+Found';
                  }}
                />
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
                  <p className="text-gray-800">{selectedThumbnail.title}</p>
                </div>
                {selectedThumbnail.description && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                    <p className="text-gray-800">{selectedThumbnail.description}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Order</label>
                    <p className="text-gray-800">{selectedThumbnail.order}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                        selectedThumbnail.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {selectedThumbnail.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                {selectedThumbnail.createdBy && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Created By</label>
                    <p className="text-gray-800">
                      {selectedThumbnail.createdBy.firstName} {selectedThumbnail.createdBy.lastName} ({selectedThumbnail.createdBy.userId})
                    </p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Created At</label>
                    <p className="text-gray-800">{new Date(selectedThumbnail.createdAt).toLocaleString()}</p>
                  </div>
                  {selectedThumbnail.updatedAt && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Updated At</label>
                      <p className="text-gray-800">{new Date(selectedThumbnail.updatedAt).toLocaleString()}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Thumbnail"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone and the image will be deleted from S3.`}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
